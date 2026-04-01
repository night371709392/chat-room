<template>
  <div class="chatroom">
    <Nav></Nav>
    <!-- 二级路由渲染区：聊天/好友/群聊/设置入口 -->
    <router-view name="main" class="main-view"></router-view>

    <Notice v-show="showNotice"></Notice>

    <FriendChat v-show="!showNotice && showFriendChat"></FriendChat>

    <!-- 右侧内容区：聊天页展示 notice/friend，其它页面保持原有 setting 子路由 -->
    <router-view v-show="!showNotice" name="setting" class="setting-view"></router-view>

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
    showNotice () {
      return this.$route.path === '/chathome/chat' && this.$store.state.chatSubStatus === 'notice'
    },
    showFriendChat () {
      return this.$route.path === '/chathome/chat' && this.$store.state.chatSubStatus === 'friend'
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
.content-view {
  flex: 1;
  min-width: 0;
}
.setting-view {
  width: 100%;
  min-height: 100vh;
}
</style>