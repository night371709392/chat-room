<template>
  <div v-if="friendDetail" class="item" :class="{ active: isActive }" @click="openFriendChat">
    <div class="head-image">
      <img :src="friendDetail.avatar || defaultAvatar" alt="">
    </div>
    <div class="right">
      <div class="name-text">
        <p>{{ friendDetail.nickname || friendDetail.username || '-' }}</p>
        <span>{{ latestMessageTimeText }}</span>
      </div>
      <div class="content-text">{{ latestMessagePreview }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactItem',
  props: {
    friendDetail: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    }
  },
  computed: {
    activeSubStatus () {
      return this.$store.state.chatSubStatus
    },
    isActive () {
      if (!this.friendDetail) return false
      if (this.activeSubStatus !== 'friend') return false
      const current = this.$store.state.currentFriendDetail
      if (!current) return false
      const currentType = current.type || 'friend'
      const itemType = this.friendDetail.type || 'friend'
      return String(current.id) === String(this.friendDetail.id) && currentType === itemType
    },
    latestMessageTimeText () {
      if (!this.friendDetail || this.friendDetail.id == null || this.friendDetail.id === '') return ''
      const list = this.$store.state.messagesByFriend[String(this.friendDetail.id)] || []
      if (list.length) {
        const latest = list[list.length - 1]
        return this.formatTime(latest && latest.timestamp)
      }
      const ts = this.friendDetail.last_msg_time
      if (ts !== undefined && ts !== null && ts !== '') {
        const n = Number(ts)
        if (Number.isFinite(n)) return this.formatTime(n > 1e12 ? n : n * 1000)
        const d = new Date(ts)
        if (!Number.isNaN(d.getTime())) return this.formatTime(d.getTime())
      }
      return ''
    },
    latestMessagePreview () {
      const isGroup = (this.friendDetail && this.friendDetail.type) === 'group'
      const emptyText = isGroup ? '' : '你们已成为好友，现在可以开始聊天了'
      if (!this.friendDetail || this.friendDetail.id == null || this.friendDetail.id === '') {
        return emptyText
      }
      const backendSummary = this.friendDetail.last_msg_main || this.friendDetail.last_msg || ''
      if (isGroup) {
        const activeId = String(this.$store.state.currentChatFriendId || '')
        const currentId = String(this.friendDetail.id)
        const list = this.$store.state.messagesByFriend[currentId] || []
        if (activeId !== currentId) {
          return backendSummary || emptyText
        }
        if (!list.length) {
          return backendSummary || emptyText
        }
        const latest = list[list.length - 1] || {}
        return this.formatPreview(latest, backendSummary || emptyText)
      }
      const list = this.$store.state.messagesByFriend[String(this.friendDetail.id)] || []
      if (list.length) {
        const latest = list[list.length - 1] || {}
        return this.formatPreview(latest, backendSummary || emptyText)
      }
      return backendSummary || emptyText
    }
  },
  methods: {
    formatPreview (latest, fallback) {
      if (Number(latest.msg_type) === 2) {
        const name = (latest.file_name || '').toLowerCase()
        const url = String(latest.file_url || latest.msg || '').toLowerCase()
        if (/\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(name) || /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(url)) {
          return '[图片]'
        }
        if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(name) || /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(url)) {
          return '[视频]'
        }
        return latest.file_name ? `[文件] ${latest.file_name}` : '[文件]'
      }
      if (Number(latest.msg_type) === 3) {
        return latest.file_name ? `[文件] ${latest.file_name}` : '[文件]'
      }
      const text = latest.msg != null ? String(latest.msg).trim() : ''
      return text || fallback
    },
    formatTime (ts) {
      const n = Number(ts)
      if (!Number.isFinite(n) || n <= 0) return '刚刚'
      const d = new Date(n)
      if (Number.isNaN(d.getTime())) return '刚刚'

      const now = new Date()
      const isSameDay = d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()

      if (isSameDay) {
        const hh = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        return `${hh}:${mm}`
      }
      return `${d.getMonth() + 1}/${d.getDate()}`
    },
    openFriendChat () {
      if (!this.friendDetail) return
      this.$store.commit('setCurrentFriendDetail', this.friendDetail)
      this.$store.commit('setCurrentChatFriendId', this.friendDetail.id)
      this.$store.commit('setChatSubStatus', 'friend')
    }
  }
}
</script>

<style scoped>
.item {
  height: 64px;
  display: flex;
  position: relative;
  margin: 2px 6px;
  padding: 6px 10px 6px 12px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 12px;
  user-select: none;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.item:hover:not(.active) {
  background-color: #f0f4fa;
}
.item .head-image {
  width: 45px;
  height: 45px;
}
.item .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.item .right {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
  min-width: 0;
  padding-left: 10px;
  text-align: left;
  overflow: hidden;
}
.item .right .name-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.item .right .name-text p {
  font-size: 14px;
  color: black;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item .right .name-text span {
  font-size: 12px;
  color: #808080;
  flex-shrink: 0;
}
.item .right .content-text {
  font-size: 12px;
  color: #808080;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item.active {
  background: linear-gradient(105deg, rgba(66, 103, 214, 0.14) 0%, rgba(66, 103, 214, 0.05) 52%, rgba(255, 255, 255, 0) 100%) !important;
  box-shadow: inset 0 0 0 1px rgba(66, 103, 214, 0.22);
}
.item.active::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(180deg, #5b73e8 0%, #3d52d4 100%);
  box-shadow: 0 2px 10px rgba(61, 82, 212, 0.45);
}
.item.active .right .name-text p {
  color: #1a1d24;
  font-weight: 600;
}
</style>