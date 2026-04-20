<template>
  <div class="message-box">
    <!-- 对方消息 -->
    <div class="message-item other">
      <div class="avater">
        <img src="https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg" alt="头像">
      </div>
      <div class="message-bubble">
        你好呀，这是一条静态消息
      </div>
    </div>

    <!-- 自己发的消息 -->
    <div class="message-item self">
      <div class="avater">
        <img :src="myAvatarUrl" alt="头像">
      </div>
      <div class="message-bubble">
        收到啦，我是静态组件
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessagePage',
  computed: {
    //（关联Vuex）
    myAvatarUrl() {
      return this.$store.state.selectedAvatarUrl || this.$store.state.userPicture || 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    },
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
  padding: 10px;
}
.message-item {
  display: flex;
  margin: 10px 0;
  gap: 10px;
  flex-direction: row;
}
.avater {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  cursor: pointer;
}
.avater img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-image: cover;
}
.message-item.self {
  flex-direction: row-reverse;
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