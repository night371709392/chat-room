<template>
  <div class="friend">
    <div class="list">
      <div class="header">
        <div class="ipt">
          <input type="text" placeholder="搜索">
        </div>
        <button @click="openPage"><i class="iconfont icon-jiahao"></i></button>
      </div>
      <div class="top-item" @click="setSubStatus('newfriend')">
        <div class="head-image">
          <img src="@/assets/img/ChatRoom/newfriend.png" alt="">
        </div>
        <div class="right">
          <p>新的朋友</p>
        </div>
      </div>
      
      <!-- 好友列表渲染 -->

    </div>
  </div>
</template>

<script>
export default {
  name: 'FriendPage',
  methods: {
    openPage () {
      this.$store.commit('openAddFriendPage')
    },
    setSubStatus (status) {
      this.$store.commit('setChatSubStatus', status)
      console.log('当前聊天子状态:', this.$store.state.chatSubStatus)
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
.friend {
  width: 260px;
  min-height: 100vh;
  border-right: 1px solid rgba(0, 0, 0, .08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, .05);
}
.friend .list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.friend .list .header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0px 12px;
}
.friend .list .header .ipt {
  width: 192px;
  height: 32px;
  line-height: 32px;
}
.friend .list .header .ipt input {
  width: 100%;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #fff;
}
.friend .list .header .ipt input:hover {
  border-color: #2830D3;
}
.friend .list .header .ipt input:focus {
  border-color: #2830D3;
}
.friend .list .header button {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  border-radius: 50%;
  border: 1px solid #fff;
  background-color: #F4F4FC;
  cursor: pointer;
}
.friend .list .header button:hover {
  color: #EAEAFB;
  transform: scale(1.1);
}
.friend .list .header .iconfont {
  color: #3458DA;
  font-size: 16px;
  font-style: normal;
}
.friend .list .top-item {
  height: 60px;
  display: flex;
  position: relative;
  padding: 5px 10px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, .08);
}
.friend .list .top-item .head-image {
  width: 45px;
  height: 45px;
}
.friend .list .top-item .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.friend .list .top-item .right {
  padding-left: 10px;
  text-align: left;
  flex: 1;
  font-size: 14px;
}
</style>