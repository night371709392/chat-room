<template>
  <div class="friend-wrap">
    <div class="friend-main">
      <div class="header">
        <span>{{ friendName }}</span>
        <span
          class="header-more"
          :class="{ active: showFriendSet }"
          role="button"
          tabindex="0"
          title="好友设置"
          @click="toggleFriendSet"
          @keydown.enter.prevent="toggleFriendSet"
        ><i class="ri ri-more-2-line"></i></span>
      </div>
      <div class="main" ref="mainScroll">
        <div v-if="!isGroupChat" class="message-tip">
          你们已成为好友，现在可以开始聊天了
        </div>
        <Message
          v-for="row in currentMessages"
          :key="row.id"
          :item="row"
        />
      </div>
      <ChatContent></ChatContent>
    </div>
    <aside class="friend-set-aside" :class="{ open: showFriendSet }">
      <div v-if="currentChatFriendId" class="friend-set-shell">
        <FriendSet v-if="!isGroupChat" :visible="showFriendSet" @close="showFriendSet = false" />
        <GroupSet v-else :visible="showFriendSet" @close="showFriendSet = false" />
      </div>
    </aside>
  </div>
</template>

<script>
import Message from './message.vue'
import ChatContent from './ChatContent.vue'
import FriendSet from './friendSet.vue'
import GroupSet from './GroupSet.vue'

export default {
  name: 'FriendChatPage',
  components: {
    Message,
    ChatContent,
    FriendSet,
    GroupSet
  },
  data () {
    return {
      showFriendSet: false
    }
  },
  computed: {
    currentChatFriendId () {
      return this.$store.state.currentChatFriendId
    },
    currentChatFriend () {
      const currentId = this.$store.state.currentChatFriendId
      if (currentId === null || currentId === undefined) return null
      return this.$store.state.chatFriendList.find(item => String(item.id) === String(currentId)) || null
    },
    isGroupChat () {
      const f = this.currentChatFriend
      if (f && f.type) return f.type === 'group'
      const d = this.$store.state.currentFriendDetail
      if (d && d.type) return d.type === 'group'
      try {
        const saved = JSON.parse(sessionStorage.getItem('chat_session'))
        if (saved && saved.chatType) return saved.chatType === 'group'
      } catch (_) { /* ignore */ }
      return false
    },
    friendName () {
      if (!this.currentChatFriend) return '聊天'
      const f = this.currentChatFriend
      return f.nickname || f.username || '聊天'
    },
    currentMessages () {
      const id = this.$store.state.currentChatFriendId
      if (id === null || id === undefined || id === '') return []
      return this.$store.state.messagesByFriend[String(id)] || []
    }
  },
  watch: {
    '$store.state.userId' (n, o) {
      const id = this.currentChatFriendId
      if (id == null || id === '') return
      if (n != null && n !== '' && (o == null || o === '')) {
        if (this.isGroupChat) {
          this.$store.dispatch('fetchGroupChatHistory', { groupId: id })
        } else {
          this.$store.dispatch('fetchChatHistory', { friendId: id })
        }
      }
    },
    currentChatFriendId: {
      immediate: true,
      handler (id) {
        this.showFriendSet = false
        if (id === null || id === undefined || id === '') return
        if (this.isGroupChat) {
          this.$store.dispatch('fetchGroupChatHistory', { groupId: id })
          this.$store.dispatch('markGroupRead', { groupId: id })
        } else {
          this.$store.dispatch('fetchChatHistory', { friendId: id })
          this.$store.dispatch('markChatRead', { friendId: id })
        }
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    currentMessages: {
      deep: true,
      handler () {
        this.$nextTick(() => this.scrollToBottom())
      }
    }
  },
  methods: {
    toggleFriendSet () {
      this.showFriendSet = !this.showFriendSet
    },
    scrollToBottom () {
      const el = this.$refs.mainScroll
      if (!el) return
      el.scrollTop = el.scrollHeight
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
.friend-wrap .header .ri {
  font-size: 24px;
  color: #303133;
}
.friend-wrap {
  flex: 1;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: row;
  min-width: 0;
  background-color: #f8f8f8;
}
.friend-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.friend-set-aside {
  flex-shrink: 0;
  width: 0;
  overflow: hidden;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f0f1f4;
  border-left: 1px solid transparent;
}
.friend-set-aside.open {
  width: 286px;
  border-left-color: #ebeef5;
}
.friend-set-shell {
  width: 286px;
  height: 100%;
  min-height: 100%;
}
.friend-wrap .header-more {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
}
.friend-wrap .header-more:hover {
  background: #f5f7fa;
}
.friend-wrap .header-more.active .ri {
  color: #3458DA;
}
.friend-wrap .header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  font-size: 18px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.friend-wrap .main {
  height: 68vh;
  padding: 0 10px;
  background: #f6f7f8;
  overflow-y: auto;
}
.friend-wrap .main .message-tip {
  line-height: 50px;
  font-size: 13px;
  color: gray;
  text-align: center;
}
</style>
