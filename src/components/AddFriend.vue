<template>
  <div class="popup">
    <van-popup v-model="$store.state.addFriendPage" :style="{ width: '560px' }" class="add-friend-popup">
      <div class="header">
        <van-icon 
          name="cross" 
          class="close-icon" 
          @click="closePage"
        />
        <span class="title">添加好友</span>
      </div>
      <div class="body">
        <input type="text" placeholder="ID/昵称/手机号/邮箱,最多展示20条">
      </div>
    </van-popup>
  </div>
</template>

<script>

import { Icon } from 'vant'

export default {
  name: 'AddFriend',
  components: {
    vanIcon: Icon
  },
  methods: {
    closePage () {
      this.$store.commit('closeAddFriendPage')
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
.title {
  font-size: 16px;
}
.body {
  min-height: 452px;
  padding: 10px 20px;
}
.body input {
  width: 100%;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.body input:focus {
  border-color: #2830D3;
}
.body input:hover {
  border-color: #2830D3;
}
</style>