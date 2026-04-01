<template>
  <div class="message-box">
    <!-- 对方消息 -->
    <div class="message-item other">
      <div class="message-bubble">
        你好呀，这是一条静态消息
      </div>
    </div>

    <!-- 自己发的消息 -->
    <div class="message-item self">
      <div class="message-bubble">
        收到啦，我是静态组件
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessagePage'
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.message-box {
  padding: 10px;
}
.message-item {
  display: flex;
  margin-bottom: 12px;
}
.message-item.self {
  justify-content: flex-end;
}
.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
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
</style>