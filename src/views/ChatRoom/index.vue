<template>
  <div class="chatroom">
    <Nav></Nav>
    <!-- 二级路由渲染区：聊天/好友/群聊/设置入口 -->
    <router-view name="main" class="main-view"></router-view>

    <!-- 系统通知 -->
    <Notice v-show="activeChatType === 'notice'"></Notice>

    <!-- 好友 -->
    <FriendChat v-show="activeChatType === 'friend' && currentFriend"></FriendChat>

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
import Notice from '@/components/notice.vue'
import FriendChat from '@/components/friend.vue'

export default {
  name: 'ChatRoom',
  components: {
    Nav,
    AddFriend,
    CreateGroup,
    Notice,
    FriendChat
  },
  computed: {
    // 从 Vuex 获取当前激活的聊天类型
    activeChatType() {
      return this.$store.getters.activeChatType
    },
    // 从 Vuex 获取当前选中的好友
    currentFriend() {
      return this.$store.getters.currentFriend
    }
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