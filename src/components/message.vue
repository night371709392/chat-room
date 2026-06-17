<template>
  <div class="message-box">
    <div class="message-item" :class="item.outgoing ? 'self' : 'other'">
      <div
        class="avater"
        :class="{ 'avater-peer': !item.outgoing }"
        role="presentation"
        @click.stop="onAvatarClick"
      >
        <img :src="avatarUrl" alt="头像">
      </div>
      <div class="bubble-wrap">
        <div v-if="showSenderName" class="sender-name">{{ senderName }}</div>
        <div v-if="isFileBubble" class="message-bubble file-bubble" @contextmenu.prevent="onContextMenu">
          <template v-if="fileHref">
            <a
              v-if="isImageFile"
              :href="fileHref"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img class="file-img" :src="fileHref" alt="">
            </a>
            <div v-else-if="isVideoFile" class="file-video-wrap">
              <video class="file-video" :src="fileHref" controls playsinline preload="metadata" />
              <a class="file-open-tab" :href="fileHref" target="_blank" rel="noopener noreferrer">新窗口打开</a>
            </div>
            <a v-else :href="fileHref" target="_blank" rel="noopener noreferrer">
              <span class="file-name">{{ item.file_name || '文件' }}</span>
            </a>
          </template>
          <span v-else class="file-name">{{ item.file_name || '文件' }}</span>
        </div>
        <div v-else class="message-bubble" @contextmenu.prevent="onContextMenu">
          {{ item.msg }}
        </div>
        <div v-if="item.pending" class="meta sending">发送中…</div>
        <div v-else-if="item.failed" class="meta failed">发送失败</div>
        <div v-else-if="timeLabel" class="meta subtle">{{ timeLabel }}</div>
      </div>
    </div>

    <ul
      v-if="menuVisible"
      ref="ctxMenu"
      class="ctx-menu"
      :style="{ left: menuPos.x + 'px', top: menuPos.y + 'px' }"
    >
      <li class="ctx-menu-item" @click="onMenuAction('copy')">
        <i class="ri ri-file-copy-line"></i><span>复制</span>
      </li>
      <li class="ctx-menu-item" @click="onMenuAction('delete')">
        <i class="ri ri-delete-bin-line"></i><span>删除</span>
      </li>
      <li v-if="item.outgoing" class="ctx-menu-item" @click="onMenuAction('recall')">
        <i class="ri ri-arrow-go-back-line"></i><span>撤回</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'MessagePage',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      menuVisible: false,
      menuPos: { x: 0, y: 0 }
    }
  },
  computed: {
    isFileBubble () {
      const t = Number(this.item.msg_type)
      return t === 2 || t === 3
    },
    isGroupChat () {
      const d = this.$store.state.currentFriendDetail
      if (d && d.type) return d.type === 'group'
      const list = this.$store.state.chatFriendList
      const fid = this.$store.state.currentChatFriendId
      if (fid && list.length) {
        const peer = list.find(item => String(item.id) === String(fid))
        if (peer && peer.type) return peer.type === 'group'
      }
      try {
        const saved = JSON.parse(sessionStorage.getItem('chat_session'))
        if (saved && saved.chatType) return saved.chatType === 'group'
      } catch (_) { /* ignore */ }
      return false
    },
    myAvatarUrl () {
      return this.$store.state.selectedAvatarUrl || this.$store.state.userPicture || 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    },
    currentChatFriend () {
      const currentId = this.$store.state.currentChatFriendId
      if (currentId === null || currentId === undefined) return null
      return this.$store.state.chatFriendList.find(item => String(item.id) === String(currentId)) || null
    },
    friendAvatarUrl () {
      return this.currentChatFriend?.avatar || 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    },
    avatarUrl () {
      if (this.item.outgoing) return this.myAvatarUrl
      if (this.isGroupChat && this.item.sender_picture) return this.item.sender_picture
      return this.friendAvatarUrl
    },
    showSenderName () {
      if (!this.isGroupChat) return false
      if (this.item.outgoing) return false
      return !!(this.senderName)
    },
    senderName () {
      const n = this.item.sender_name || ''
      return String(n).trim()
    },
    fileHref () {
      const u = this.item.file_url || this.item.msg
      return u && String(u).trim() ? String(u).trim() : ''
    },
    isImageFile () {
      const n = (this.item.file_name || '').toLowerCase()
      const u = (this.fileHref || '').toLowerCase()
      if (/\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(n) || /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(u)) return true
      return false
    },
    isVideoFile () {
      const n = (this.item.file_name || '').toLowerCase()
      const u = (this.fileHref || '').toLowerCase()
      if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(n) || /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(u)) {
        return true
      }
      return false
    },
    timeLabel () {
      const t = this.item.timestamp
      if (t == null || t === '') return ''
      const n = Number(t)
      if (!Number.isFinite(n) || n <= 0) return ''
      const d = new Date(n)
      if (Number.isNaN(d.getTime())) return ''
      const pad = n => (n < 10 ? `0${n}` : `${n}`)
      return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  },
  beforeDestroy () {
    this.unbindCloseListeners()
  },
  methods: {
    onContextMenu (e) {
      this.menuVisible = true
      // 先用点击坐标，待菜单渲染后再做边界检测修正
      this.menuPos = { x: e.clientX, y: e.clientY }
      this.$nextTick(() => this.clampMenuToViewport())
      this.bindCloseListeners()
    },
    clampMenuToViewport () {
      const el = this.$refs.ctxMenu
      if (!el) return
      const rect = el.getBoundingClientRect()
      const margin = 8
      let { x, y } = this.menuPos
      const maxX = window.innerWidth - rect.width - margin
      const maxY = window.innerHeight - rect.height - margin
      if (x > maxX) x = Math.max(margin, maxX)
      if (y > maxY) y = Math.max(margin, maxY)
      if (x < margin) x = margin
      if (y < margin) y = margin
      this.menuPos = { x, y }
    },
    closeMenu () {
      if (!this.menuVisible) return
      this.menuVisible = false
      this.unbindCloseListeners()
    },
    bindCloseListeners () {
      // 延迟到下一帧绑定，避免本次右键/点击立即触发关闭
      this._onDocClick = () => this.closeMenu()
      this._onScroll = () => this.closeMenu()
      this._onKeydown = (e) => { if (e.key === 'Escape') this.closeMenu() }
      window.setTimeout(() => {
        document.addEventListener('click', this._onDocClick)
        document.addEventListener('contextmenu', this._onDocClick)
        window.addEventListener('scroll', this._onScroll, true)
        window.addEventListener('resize', this._onScroll)
        document.addEventListener('keydown', this._onKeydown)
      }, 0)
    },
    unbindCloseListeners () {
      document.removeEventListener('click', this._onDocClick)
      document.removeEventListener('contextmenu', this._onDocClick)
      window.removeEventListener('scroll', this._onScroll, true)
      window.removeEventListener('resize', this._onScroll)
      document.removeEventListener('keydown', this._onKeydown)
    },
    onMenuAction (action) {
      this.closeMenu()
      if (action === 'recall') {
        this.recallMessage()
        return
      }
      // 复制 / 删除 逻辑后续实现
      void action
    },
    recallMessage () {
      // 只能撤回自己发送的消息，后端同样会校验 sender_id，前端先拦一次
      if (!this.item.outgoing) {
        this.$toast('只能撤回自己发送的消息')
        return
      }
      const msgId = this.item.msg_id != null ? String(this.item.msg_id).trim() : ''
      if (!msgId) {
        this.$toast('该消息暂不支持撤回')
        return
      }
      // 只能撤回 2 分钟以内的消息
      const ts = Number(this.item.timestamp)
      const TWO_MIN = 2 * 60 * 1000
      if (!Number.isFinite(ts) || ts <= 0 || Date.now() - ts > TWO_MIN) {
        this.$toast('只能撤回 2 分钟以内的消息')
        return
      }
      const convId = this.$store.state.currentChatFriendId
      if (convId == null || convId === '') return

      const isGroup = this.isGroupChat
      const isFile = Number(this.item.msg_type) === 2 || Number(this.item.msg_type) === 3
      let url
      let data
      if (isGroup) {
        url = isFile ? '/api/group/recall/doc' : '/api/group/recall/msg'
        data = { group_id: Number(convId), msg_id: msgId }
      } else {
        url = isFile ? '/api/chat/recall/doc' : '/api/chat/recall/msg'
        data = { friend_id: Number(convId), msg_id: msgId }
      }

      this.$axios({ url, method: 'post', data }).then(res => {
        const d = res && res.data
        const ok =
          d === 'success' ||
          (d && typeof d === 'object' && (
            d.error === 'success' || d.err === 'success' ||
            d.message === 'success' || d.msg === 'success' ||
            d.code === 0 || d.code === '0'
          ))
        if (ok) {
          this.$store.commit('removeMessageFromConversation', {
            friendId: convId,
            rowId: this.item.id,
            msgId
          })
          this.$toast.success ? this.$toast.success('已撤回') : this.$toast('已撤回')
        } else {
          const m = (d && (d.message || d.msg || d.error || d.err)) || '撤回失败'
          this.$toast.fail ? this.$toast.fail(String(m)) : this.$toast(String(m))
        }
      }).catch(err => {
        console.warn('[recallMessage]', err)
        this.$toast.fail ? this.$toast.fail('网络异常，请稍后重试') : this.$toast('网络异常，请稍后重试')
      })
    },
    onAvatarClick () {
      if (this.item.outgoing) return
      if (this.isGroupChat) return
      const id = this.$store.state.currentChatFriendId
      if (id === null || id === undefined || id === '') return
      this.$store.dispatch('fetchFriendDetailPanel', { friendId: id })
      this.$store.commit('setChatSubStatus', 'friendDetail')
      this.$router.push('/chathome/friend')
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
.message-box {
  padding: 4px 10px;
}
.message-item {
  display: flex;
  margin: 6px 0;
  gap: 10px;
  flex-direction: row;
}
.avater {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  flex-shrink: 0;
}
.avater img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.avater-peer {
  cursor: pointer;
}
.avater-peer:hover {
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.35);
}
.message-item.self {
  flex-direction: row-reverse;
}
.bubble-wrap {
  max-width: 72%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.message-item.self .bubble-wrap {
  align-items: flex-end;
}
.message-bubble {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}
.other .message-bubble {
  background: #f1f1f1;
  color: #333;
  border-top-left-radius: 0;
}
.self .message-bubble {
  background: #4285f4;
  color: #fff;
  border-top-right-radius: 0;
}
.file-bubble {
  background: #eef3ff !important;
  padding: 6px;
}
.self .file-bubble {
  background: #ddebff !important;
}
.file-img {
  display: block;
  max-width: 220px;
  max-height: 220px;
  border-radius: 6px;
}
.file-video-wrap {
  display: block;
  max-width: min(280px, 100%);
}
.file-video {
  display: block;
  width: 100%;
  max-height: 220px;
  border-radius: 6px;
  vertical-align: middle;
  background: #000;
}
.file-open-tab {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  color: #3367d6;
}
.file-name {
  font-size: 13px;
  color: #3367d6;
}
.meta {
  font-size: 11px;
  margin-top: 2px;
  color: #888;
}
.meta.subtle {
  color: #aaa;
}
.meta.sending {
  color: #999;
}
.meta.failed {
  color: #e54d42;
}
.sender-name {
  font-size: 12px;
  color: #8b90a0;
  margin-bottom: 2px;
  padding-left: 2px;
}
.ctx-menu {
  position: fixed;
  z-index: 3000;
  min-width: 120px;
  padding: 4px;
  margin: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
.ctx-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #303133;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}
.ctx-menu-item:hover {
  background: #f5f7fa;
}
.ctx-menu-item .ri {
  font-size: 16px;
  color: #606266;
}
</style>
