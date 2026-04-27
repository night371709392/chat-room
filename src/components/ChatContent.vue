<template>
  <div class="chat-content">
    <div class="header">
      <div><i title="表情" class="ri ri-emotion-line"></i></div>
      <div><i title="发送图片" class="ri ri-image-add-line"></i></div>
      <div><i title="发送视频" class="ri ri-video-add-line"></i></div>
      <div><i title="发送文件" class="ri ri-file-upload-line"></i></div>
      <div><i title="发送语音" class="ri ri-mic-line"></i></div>
      <div><i title="通话" class="ri ri-vidicon-line"></i></div>
      <div><i title="聊天记录" class="ri ri-chat-history-line" @click="getChatNode"></i></div>
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
  </div>
</template>

<script>
import { Toast } from 'vant'

export default {
  name: 'ChatContentPage',
  data () {
    return {
      draft: ''
    }
  },
  computed: {
    socketConnected () {
      return this.$store.state.socketConnected
    },
    currentFriendId () {
      return this.$store.state.currentChatFriendId
    },
    sendDisabled () {
      const t = this.draft.trim()
      return !this.currentFriendId || !t
    }
  },
  methods: {
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
  min-height: 72px;
  border: none;
  outline: none;
  resize: vertical;
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
  margin-bottom: 10px;
  flex-shrink: 0;
}
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.send-btn:active:not(:disabled) {
  background: #2952b3;
}
</style>
