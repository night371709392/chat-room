<template>
  <div class="newfriend">
    <div class="header">
      新的朋友
    </div>
    <div class="el-tabs">
      <div class="get" :class="{ active: activeTab === 'get' }" @click="activeTab = 'get'">收到的申请(0)</div>
      <div class="post" :class="{ active: activeTab === 'post' }"  @click="activeTab = 'post'">发起的申请(0)</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewFriendPage',
  data() {
    return {
      activeTab: 'get'
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
.newfriend {
  flex: 1;
  max-height: 100vh;
  background-color: #FCFDFF;
}
.newfriend .header {
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 18px;
}
.newfriend .el-tabs {
  display: flex;
  border-bottom: 1px solid #E4E7ED;
}
.newfriend .el-tabs div {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  list-style: none;
  font-size: 16px;
  border: 1px solid #E4E7ED;
  border-left: none;
  border-bottom: none;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}
.newfriend .el-tabs div:hover {
  position: relative;
  bottom: 2px;
}
.newfriend .el-tabs div.active {
  color: #409EFF;
  border-bottom: 2px solid #409EFF;
  font-weight: 500;
}
</style>