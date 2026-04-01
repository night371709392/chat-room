<template>
  <div class="chat-content">
    <div class="header">
      <div><i class="iconfont icon-biaoqing"></i></div>
      <div><i class="iconfont icon-fasongtupian"></i></div>
      <div><i class="iconfont icon-fasongshipin"></i></div>
      <div><i class="iconfont icon-fasongwenjian"></i></div>
      <div><i class="iconfont icon-fasongyuyin"></i></div>
      <div><i class="iconfont icon-video"></i></div>
      <div><i class="iconfont icon-liaotianjilu"></i></div>
    </div>

    <div class="main">
      <textarea class="message-input" placeholder="请输入消息..."></textarea>
      
      <button class="send-btn">
        发送
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatContentPage',
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
  position: relative;
  padding: 5px;
  font-size: 14px;
  background: #fff;
}
.message-input {
  border: none;
  outline: none;
  width: 100%;
  min-height: 155px;
  padding: 8px;
  padding-bottom: 50px;
  font-size: 14px;
  resize: none;
  line-height: 1.6;
  text-align: left;
}
.send-btn {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 70px;
  height: 32px;
  background: #4285f4;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.send-btn:active {
  background: #3367d6;
}
</style>