<template>
  <div class="chat-content">
    <div class="header">
      <div><i title="表情" class="iconfont icon-biaoqing"></i></div>
      <div><i title="发送图片" class="iconfont icon-fasongtupian"></i></div>
      <div><i title="发送视频" class="iconfont icon-fasongshipin"></i></div>
      <div><i title="发送文件" class="iconfont icon-fasongwenjian"></i></div>
      <div><i title="发送语音" class="iconfont icon-fasongyuyin"></i></div>
      <div><i title="通话" class="iconfont icon-video"></i></div>
      <div><i title="聊天记录" class="iconfont icon-liaotianjilu" @click="openPage"></i></div>
    </div>

    <div class="main">
      <div class="input-wrapper">
        <textarea class="message-input" placeholder="请输入消息..."></textarea>
      </div>
      <button class="send-btn">
        发送
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatContentPage',
  methods: {
    openPage () {
      this.$store.commit('openChatNotePage')
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
  font-size: 30px;
  color: black;
  cursor: pointer;
}
.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  height: 44px;
  align-items: center;
  border-top: 2px solid #ebeef5;
  padding: 6px 8px;
  background-color: rgb(244, 244, 252);
  gap: 8px;
}
.icon-fasongtupian {
  font-size: 36px;
}
.icon-fasongyuyin {
  font-size: 28px;
}
.icon-video {
  font-size: 25px;
}
.icon-liaotianjilu {
  font-size: 25px;
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
.input-wrapper {
  flex: 1;
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
  margin-bottom: 10px;
  flex-shrink: 0;
}
.send-btn:active {
  background: #3367d6;
}
</style>