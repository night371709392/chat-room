<template>
  <div class="friend">
    <div class="header">
      <span>{{ friendName }}</span>
      <span><i class="iconfont icon-gengduo"></i></span>
    </div>
    <div class="main">
      <div class="message-tip">
        你们已成为好友，现在可以开始聊天了
      </div>
      <Message></Message>
      <Message></Message>
      <Message></Message>
      <Message></Message>
      <Message></Message>
      <Message></Message>
      <Message></Message>
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
    currentChatFriend () {
      const currentId = this.$store.state.currentChatFriendId
      if (currentId === null || currentId === undefined) return null
      return this.$store.state.chatFriendList.find(item => String(item.id) === String(currentId)) || null
    },
    friendName () {
      if (!this.currentChatFriend) return '聊天'
      return this.currentChatFriend.username || this.currentChatFriend.nickname || '聊天'
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
.iconfont {
  font-size: 25px;
  color: black;
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