<template>
  <div class="chatroom">
    <Nav></Nav>
    <!-- 二级路由渲染区：聊天/好友/群聊/设置入口 -->
    <router-view name="main" class="main-view"></router-view>
    <!-- 三级路由渲染区：个人资料/手机/邮箱/密码等（仅setting下的三级路由显示） -->
    <router-view name="setting" class="setting-view"></router-view>

    <AddFriend v-show="$store.state.addFriendPage"></AddFriend>
    <CreateGroup v-show="$store.state.createGroupPage"></CreateGroup>
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'
import AddFriend from '@/components/AddFriend.vue'
import CreateGroup from '@/components/CreateGroup.vue'

export default {
  name: 'ChatRoom',
  components: {
    Nav,
    AddFriend,
    CreateGroup
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.chatroom {
  display: flex;
  min-height: 100vh;
  flex: 1;
}
.main-view {
  flex: 1;
  min-width: 260px;
  max-width: 260px;
  border-right: 1px solid #eee;
  min-height: 100vh;
}
.setting-view {
  width: 814px;
  min-height: 100vh;
}
</style>