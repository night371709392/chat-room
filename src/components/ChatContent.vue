<template>
  <div class="chat-content">
    <div class="header">
      <div><i title="表情" class="ri ri-emotion-line"></i></div>
      <div title="发送图片" @click="openFilePicker('image')">
        <i class="ri ri-image-add-line"></i>
      </div>
      <div title="发送视频" @click="openFilePicker('video')">
        <i class="ri ri-video-add-line"></i>
      </div>
      <div title="发送文件" @click="openFilePicker('any')">
        <i class="ri ri-file-upload-line"></i>
      </div>
      <div><i title="发送语音" class="ri ri-mic-line"></i></div>
      <div><i title="通话" class="ri ri-vidicon-line"></i></div>
      <div title="聊天记录" @click="openChatNote">
        <i class="ri ri-chat-history-line"></i>
      </div>
    </div>

    <div class="main">
      <div v-if="!socketConnected" class="conn-hint">未连接服务器，消息将无法发出</div>
      <div class="input-wrapper">
        <textarea
          v-model="draft"
          class="message-input"
          placeholder="请输入消息…"
          rows="3"
          @keydown.enter.exact.prevent="send"
        />
      </div>
      <button class="send-btn" type="button" :disabled="sendDisabled" @click="send">
        发送
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      class="hidden-file-input"
      :accept="fileInputAccept"
      @change="onFileInputChange"
    >
  </div>
</template>

<script>
import { Toast } from 'vant'
import { uploadChatAttachment } from '@/utils/chatUpload'

export default {
  name: 'ChatContentPage',
  data () {
    return {
      draft: '',
      fileInputAccept: '*/*',
      fileUploading: false,
      pendingBlobUrl: null
    }
  },
  computed: {
    socketConnected () {
      return this.$store.state.socketConnected
    },
    currentFriendId () {
      const id = this.$store.state.currentChatFriendId
      if (id !== null && id !== undefined && id !== '') return id
      return this.$store.state.currentFriendDetail?.id ?? null
    },
    sendDisabled () {
      const t = this.draft.trim()
      return !this.currentFriendId || !t
    }
  },
  beforeDestroy () {
    this._revokeBlobIfAny()
  },
  methods: {
    _revokeBlobIfAny () {
      const u = this.pendingBlobUrl
      if (u && String(u).startsWith('blob:')) {
        try {
          URL.revokeObjectURL(u)
        } catch {
          /* revokeObjectURL 失败时忽略 */
        }
      }
      this.pendingBlobUrl = null
    },
    openFilePicker (kind) {
      if (this.fileUploading) {
        Toast('正在上传，请稍候')
        return
      }
      const fid = this.currentFriendId
      if (!fid) {
        Toast('请先选择聊天好友')
        return
      }
      if (!this.socketConnected) {
        Toast('未连接服务器')
        return
      }
      if (kind === 'image') this.fileInputAccept = 'image/*'
      else if (kind === 'video') this.fileInputAccept = 'video/*'
      else this.fileInputAccept = '*/*'
      this.$nextTick(() => {
        const el = this.$refs.fileInput
        if (el) el.click()
      })
    },
    async onFileInputChange (e) {
      const input = e.target
      const file = input && input.files && input.files[0]
      if (input) input.value = ''
      if (!file) return

      const fid = this.currentFriendId
      if (!fid) return

      const tempId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const fileName = file.name || '文件'
      let localUrl = ''
      const canBlobPreview =
        file.type && (file.type.startsWith('image/') || file.type.startsWith('video/'))
      if (canBlobPreview) {
        try {
          localUrl = URL.createObjectURL(file)
          this.pendingBlobUrl = localUrl
        } catch (_) {
          localUrl = ''
        }
      }

      this.$store.commit('appendPendingOutMessage', {
        friendId: fid,
        msg: localUrl,
        tempId,
        msg_type: 2,
        file_url: localUrl,
        file_name: fileName
      })

      this.fileUploading = true
      let serverUrl = ''
      let uploadFileName = fileName
      try {
        const uploaded = await uploadChatAttachment(file, { receiverId: fid })
        serverUrl = uploaded.url
        uploadFileName = uploaded.fileName || fileName
      } catch (err) {
        this._revokeBlobIfAny()
        this.$store.commit('chatMessageSendFailed', { friendId: fid, tempId })
        const d = err && err.response && err.response.data
        let tip = ''
        if (d && typeof d === 'object') {
          tip = (typeof d.message === 'string' && d.message.trim()) ||
            (typeof d.msg === 'string' && d.msg.trim()) ||
            (typeof d.error === 'string' && d.error.trim()) ||
            (typeof d.err === 'string' && d.err.trim()) ||
            ''
        }
        if (!tip && err && err.message) tip = String(err.message)
        if (!tip) tip = '上传失败'
        Toast.fail(tip)
        this.fileUploading = false
        return
      }

      this._revokeBlobIfAny()
      this.$store.commit('updatePendingOutFileUrl', {
        friendId: fid,
        tempId,
        msg: serverUrl,
        file_url: serverUrl,
        file_name: uploadFileName
      })

      const ok = this.$socket.emitPrivateFile(fid, serverUrl, uploadFileName)
      if (!ok) {
        this.$store.commit('chatMessageSendFailed', { friendId: fid, tempId })
        Toast.fail(this.socketConnected ? '发送失败' : '未连接，请稍后重试')
      }
      this.fileUploading = false
    },
    openChatNote () {
      this.$store.commit('setCurrentChatFriendId', this.currentFriendId)
      this.$store.commit('openChatNotePage')
    },
    send () {
      const text = this.draft.trim()
      const fid = this.currentFriendId
      if (!fid || !text) return

      const tempId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      this.$store.commit('appendPendingOutMessage', {
        friendId: fid,
        msg: text,
        tempId,
        msg_type: 1
      })

      const ok = this.$socket.emitPrivateText(fid, text)
      if (!ok) {
        this.$store.commit('chatMessageSendFailed', { friendId: fid, tempId })
        Toast.fail(this.socketConnected ? '发送失败' : '未连接，请稍后重试')
      }
      this.draft = ''
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  min-height: 48px;
  align-items: center;
  border-top: 1px solid #e8ecf2;
  padding: 8px 10px;
  background: linear-gradient(180deg, #fafbfd 0%, #f3f5f9 100%);
  gap: 6px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.header > div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease;
}
.header > div:hover {
  background: rgba(51, 103, 214, 0.1);
  box-shadow: 0 1px 3px rgba(15, 37, 64, 0.06);
}
.header > div:active {
  transform: scale(0.94);
  background: rgba(51, 103, 214, 0.14);
}
.header .ri {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
  color: #5a6a85;
  cursor: pointer;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: color 0.2s ease;
}
.header > div:hover .ri {
  color: #2f62d5;
}
.main {
  flex: 1;
  position: relative;
  padding: 5px;
  font-size: 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.conn-hint {
  font-size: 12px;
  color: #e6a23c;
  padding: 4px 2px;
}
.input-wrapper {
  flex: 1;
  min-height: 72px;
}
.message-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  overflow: auto;
  line-height: 20px;
}
.send-btn {
  width: 60px;
  height: 30px;
  align-self: flex-end;
  border-radius: 8px;
  border: none;
  background-color: #3367d6;
  color: white;
  cursor: pointer;
  margin: 10px 0;
  flex-shrink: 0;
}
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.send-btn:active:not(:disabled) {
  background: #2952b3;
}
.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
