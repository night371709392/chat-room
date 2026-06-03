<template>
  <div class="popup">
    <van-popup v-model="$store.state.chatNotePage" :style="{ width: '420px' }">
      <div class="header">
        <van-icon 
          name="cross" 
          class="close-icon"
          @click="closePage"
        />
        <span>聊天记录</span>
      </div>
      <div class="chat-history">
        <div class="search-wrapper">
          <input type="text" placeholder="搜索聊天记录">
          <div class="search">
            <i class="ri ri-search-line"></i>
          </div>
        </div>
        <div class="el-tabs">
          <div class="all" :class="{ active: activeTab === 'all' }" @click="setTab('all')">全部</div>
          <div :class="{ active: activeTab === 'text' }" @click="setTab('text')">文字</div>
          <div class="photo" :class="{ active: activeTab === 'image' }" @click="setTab('image')">图片</div>
        </div>
        <div class="content">
          <div v-if="loading" class="state-tip">加载中...</div>
          <div v-else-if="!displayList.length" class="state-tip">暂无聊天记录</div>
          <div class="item" v-for="item in displayList" :key="item.id">
            <div class="avater">
              <img :src="item.user_picture" alt="">
            </div>
            <div class="message">
              <div class="top">
                <span class="name">{{ item.user_name }}</span>
                <span class="time">{{ item.time_string }}</span>
              </div>
              <div class="bottom">
                <template v-if="(Number(item.msg_type) === 2 || Number(item.msg_type) === 3) && item.file_url">
                  <a
                    v-if="item.is_image"
                    :href="item.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="note-media-link"
                  >
                    <img class="note-thumb" :src="item.file_url" alt="">
                  </a>
                  <video
                    v-else-if="item.is_video"
                    class="note-video"
                    :src="item.file_url"
                    controls
                    playsinline
                    preload="metadata"
                  />
                  <a
                    v-else
                    :href="item.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="note-file-link"
                  >{{ item.file_name || '下载文件' }}</a>
                </template>
                <span v-else>{{ item.context }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Icon } from 'vant'

export default {
  name: 'ChatNote',
  components: {
    vanIcon: Icon
  },
  data () {
    return {
      // 默认高亮 “全部”
      activeTab: 'all',
      chatNoteList: [],
      loading: false,
      cacheByFriend: {},
      reqSeq: 0
    }
  },
  computed: {
    displayList () {
      if (this.activeTab === 'all') return this.chatNoteList
      if (this.activeTab === 'image') {
        return this.chatNoteList.filter(x => (Number(x.msg_type) === 2 || Number(x.msg_type) === 3) && x.is_image)
      }
      if (this.activeTab === 'text') {
        return this.chatNoteList.filter(x => {
          const t = Number(x.msg_type)
          return t !== 2 && t !== 3
        })
      }
      return this.chatNoteList
    }
  },
  watch: {
    '$store.state.chatNotePage' (open) {
      if (!open) return
      this.loadChatNote(this.$store.state.currentChatFriendId, { forceRefresh: false })
    },
    '$store.state.currentChatFriendId' (id) {
      if (!this.$store.state.chatNotePage) return
      this.loadChatNote(id, { forceRefresh: false })
    },
    /** 备注等会话信息变更后，重算当前弹窗里的对方昵称 */
    '$store.state.chatFriendList': {
      deep: true,
      handler () {
        if (!this.$store.state.chatNotePage) return
        const id = this.$store.state.currentChatFriendId
        if (id == null || id === '') return
        const fid = String(id)
        const n = Number(id)
        if (!Number.isFinite(n)) return
        const list = this.normalizeChatNoteListFromStore(n)
        this.chatNoteList = list
        if (this.cacheByFriend[fid]) {
          this.cacheByFriend[fid] = { ts: Date.now(), list }
        }
      }
    }
  },
  methods: {
    isImageUrlOrName (fileName, url) {
      const n = (fileName || '').toLowerCase()
      const u = (url || '').toLowerCase()
      return /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(n) || /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(u)
    },
    isVideoUrlOrName (fileName, url) {
      const n = (fileName || '').toLowerCase()
      const u = (url || '').toLowerCase()
      return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(n) || /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i.test(u)
    },
    normalizeChatNoteListFromStore (friendId) {
      const list = this.$store.state.messagesByFriend[String(friendId)] || []
      const friend = this.$store.state.chatFriendList.find(x => String(x.id) === String(friendId)) ||
        this.$store.state.currentFriendDetail ||
        {}
      const isGroup = friend.type === 'group'
      const friendName = friend.nickname || friend.username || (isGroup ? '群聊' : '好友')
      const friendAvatar = friend.avatar || friend.picture || friend.friend_picture || ''
      const myName = this.$store.state.userName || '我'
      const myAvatar = this.$store.state.userPicture || ''
      return list
        .slice()
        .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0))
        .map((m, idx) => {
          const msgType = Number(m.msg_type) || 1
          const fileUrl = String(m.file_url || m.msg || '').trim()
          const fileName = m.file_name != null ? String(m.file_name) : ''
          const isMedia = (msgType === 2 || msgType === 3) && !!fileUrl
          const isImage = isMedia && this.isImageUrlOrName(fileName, fileUrl)
          const isVideo = isMedia && !isImage && this.isVideoUrlOrName(fileName, fileUrl)
          const isFile = Number(m.msg_type) === 3 && !fileUrl
          let context = m.msg || ''
          if (msgType === 2 || msgType === 3) {
            if (isImage) context = '[图片]'
            else if (isVideo) context = '[视频]'
            else context = fileName ? `[文件] ${fileName}` : '[文件]'
          } else if (isFile) {
            context = fileName ? `[文件] ${fileName}` : '[文件]'
          }
          let senderName, senderAvatar
          if (m.outgoing) {
            senderName = myName
            senderAvatar = myAvatar
          } else if (isGroup && m.sender_name) {
            senderName = m.sender_name
            senderAvatar = m.sender_picture || friendAvatar
          } else {
            senderName = friendName
            senderAvatar = friendAvatar
          }
          const t = Number(m.timestamp)
          const timeString = Number.isFinite(t) && t > 0
            ? new Date(t).toLocaleString()
            : ''
          return {
            id: m.id || `note-${friendId}-${idx}`,
            user_name: senderName,
            user_picture: senderAvatar,
            context,
            time_string: timeString,
            msg_type: msgType,
            file_url: fileUrl,
            file_name: fileName,
            is_image: isImage,
            is_video: isVideo
          }
        })
    },
    loadChatNote (friendId, { forceRefresh = false } = {}) {
      if (friendId === null || friendId === undefined || friendId === '') return
      const fid = Number(friendId)
      if (!Number.isFinite(fid)) return

      const cacheKey = String(fid)
      const now = Date.now()
      const localList = this.normalizeChatNoteListFromStore(fid)
      this.chatNoteList = localList

      const cache = this.cacheByFriend[cacheKey]
      // 20s 内复用结果，避免频繁打开弹窗重复等待接口
      if (!forceRefresh && cache && (now - cache.ts < 20000)) {
        this.chatNoteList = cache.list
        return
      }

      const seq = ++this.reqSeq
      this.loading = true

      const isGroup = (this.$store.state.chatFriendList.find(x => String(x.id) === String(fid)) || {}).type === 'group' ||
        (this.$store.state.currentFriendDetail || {}).type === 'group'
      const action = isGroup ? 'fetchGroupChatHistory' : 'fetchChatHistory'
      const payload = isGroup ? { groupId: fid } : { friendId: fid }

      this.$store.dispatch(action, payload).then(() => {
        // 若用户切换到其他好友，丢弃旧请求结果
        if (seq !== this.reqSeq) return
        const nextList = this.normalizeChatNoteListFromStore(fid)
        this.chatNoteList = nextList
        this.cacheByFriend[cacheKey] = {
          ts: Date.now(),
          list: nextList
        }
      }).catch(() => {}).finally(() => {
        if (seq === this.reqSeq) {
          this.loading = false
        }
      })
    },
    fetchChatNoteList (friendId) {
      // 兼容可能的旧调用入口，统一走优化后的加载逻辑
      this.loadChatNote(friendId, { forceRefresh: true })
    },
    fetchChatNoteListFromApi (fid) {
      return this.$axios({
        url: '/api/chat/history',
        method: 'get',
        params: {
          receiver_id: fid
        }
      })
    },
    setTab (tab) {
      this.activeTab = tab
    },
    closePage () {
      this.$store.commit('closeChatNotePage')
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
.search .ri {
  font-size: 22px;
  color: #606266;
}
.header {
  height: 48px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.close-icon {
  position: absolute;
  right: 18px;
  font-size: 20px;
  cursor: pointer;
}
.chat-history {
  display: flex;
  padding: 0 25px;
  flex-direction: column;
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.search-wrapper input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.search-wrapper input:focus {
  border-color: #2830D3;
}
.search-wrapper input:hover {
  border-color: #2830D3;
}
.search {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-tabs {
  display: flex;
  text-align: center;
  border-bottom: 1px solid gray;
  margin: 0 0 15px;
  user-select: none;
}
.el-tabs div {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  list-style: none;
  font-size: 14px;
  cursor: pointer;
}
.el-tabs .all {
  padding-left: 0;
}
.el-tabs .photo {
  padding-right: 0;
}
.el-tabs div.active {
  color: #2830D3;
  font-weight: bold;
}
.content {
  flex: 1;
  max-height: 45vh;
  overflow: auto;
}
.state-tip {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}
.item {
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 10px;
  margin-right: 20px;
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
.avater {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #326EB6;
}
.avater img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.message {
  flex: 1;
  min-width: 0;
  margin-left: 10px;
  text-align: left;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: gray;
  font-size: 14px;
  line-height: 20px;
  gap: 12px;
}
.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.time {
  flex-shrink: 0;
}
.bottom {
  margin-top: 2px;
}
.bottom span {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.note-media-link {
  display: inline-block;
  max-width: 100%;
}
.note-thumb {
  display: block;
  max-width: 200px;
  max-height: 160px;
  border-radius: 8px;
  vertical-align: top;
}
.note-video {
  display: block;
  max-width: 220px;
  max-height: 160px;
  border-radius: 8px;
  background: #111;
}
.note-file-link {
  color: #2830d3;
  font-size: 14px;
  word-break: break-all;
}
</style>
