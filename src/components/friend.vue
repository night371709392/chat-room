<template>
  <div class="friend">
    <div class="header">
      <span>羽烬缘</span>
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