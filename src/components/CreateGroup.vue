<template>
  <div class="popup">
    <van-popup v-model="$store.state.createGroupPage" :style="{ width: '420px' }">
      <div class="header">
        <van-icon 
          name="cross" 
          class="close-icon"
          @click="closePage"
        />
        <span>创建群聊</span>
      </div>
      <div class="content">
        <p>请输入群聊名称</p>
        <div class="ipt">
          <input type="text">
        </div>
      </div>
      <div class="btns">
        <button class="cancel" @click="closePage">取消</button>
        <button class="ensure">确定</button>
      </div>
    </van-popup>
  </div>
</template>

<script>

import { Icon } from 'vant'

export default {
  name: 'CreateGroup',
  components: {
    vanIcon: Icon
  },
  methods: {
    closePage () {
      this.$store.commit('closeCreateGroupPage')
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
  height: 43px;
  padding: 15px;
  padding-bottom: 10px;
  position: relative;
  display: flex;
  align-items: center;
}
.close-icon {
  position: absolute;
  right: 18px;
  font-size: 20px;
  cursor: pointer;
}
.header span {
  font-size: 18px;
  color: #303133;
}
.content {
  padding: 10px 15px;
  color: #000;
  font-size: 14px;
}
.content p {
  margin: 0;
  line-height: 24px;
}
.content .ipt {
  padding-top: 15px;
}
.content .ipt input {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.content .ipt input:focus {
  border-color: #2830D3;
}
.content .ipt input:hover {
  border-color: #2830D3;
}
.btns {
  padding: 5px 15px;
  text-align: right;
}
.btns button {
  width: 72px;
  height: 36px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  border-radius: 8px;
  transition: all .3s ease;
}
.btns button:hover {
  position: relative;
  bottom: 1px;
}
.btns .ensure {
  margin-left: 10px;
  background: #444BD8;
  border: none;
  color: white;
}
</style>