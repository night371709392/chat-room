<template>
  <div class="friend">
    <div class="header">
      <span>{{ friendName }}</span>
      <span><i class="ri ri-more-2-line"></i></span>
    </div>
    <div class="main" ref="mainScroll">
      <div class="message-tip">
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
</template>

<script>
import Message from './message.vue'
import ChatContent from './ChatContent.vue'

export default {
  name: 'FriendChatPage',
  components: {
    Message,
    ChatContent
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
    friendName () {
      if (!this.currentChatFriend) return '聊天'
      return this.currentChatFriend.username || this.currentChatFriend.nickname || '聊天'
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
        this.$store.dispatch('fetchChatHistory', { friendId: id })
      }
    },
    currentChatFriendId: {
      immediate: true,
      handler (id) {
        if (id === null || id === undefined || id === '') return
        this.$store.dispatch('fetchChatHistory', { friendId: id })
        this.$store.dispatch('markChatRead', { friendId: id })
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
.friend .header .ri {
  font-size: 24px;
  color: #303133;
}
.friend {
  flex: 1;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}
.friend .header {
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
.friend .main {
  height: 68vh;
  padding: 0 10px;
  background: #f6f7f8;
  overflow-y: auto;
}
.friend .main .message-tip {
  line-height: 50px;
  font-size: 13px;
  color: gray;
  text-align: center;
}
</style>
