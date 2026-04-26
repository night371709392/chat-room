<template>
  <div class="message-box">
    <div class="message-item" :class="item.outgoing ? 'self' : 'other'">
      <div class="avater">
        <img :src="item.outgoing ? myAvatarUrl : friendAvatarUrl" alt="头像">
      </div>
      <div class="bubble-wrap">
        <div v-if="item.msg_type === 2" class="message-bubble file-bubble">
          <a v-if="fileHref" :href="fileHref" target="_blank" rel="noopener noreferrer">
            <img v-if="isImageFile" class="file-img" :src="fileHref" alt="">
            <span v-else class="file-name">{{ item.file_name || '文件' }}</span>
          </a>
        </div>
        <div v-else class="message-bubble">
          {{ item.msg }}
        </div>
        <div v-if="item.pending" class="meta sending">发送中…</div>
        <div v-else-if="item.failed" class="meta failed">发送失败</div>
        <div v-else-if="timeLabel" class="meta subtle">{{ timeLabel }}</div>
      </div>
    </div>
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
  computed: {
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
    timeLabel () {
      const t = this.item.timestamp
      if (t == null || t === '') return ''
      const d = new Date(Number(t))
      if (Number.isNaN(d.getTime())) return ''
      const pad = n => (n < 10 ? `0${n}` : `${n}`)
      return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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
</style>
