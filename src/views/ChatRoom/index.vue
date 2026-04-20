<template>
  <div class="chatroom">
    <Nav></Nav>
    <!-- 二级路由渲染区：聊天/好友/群聊/设置入口 -->
    <router-view name="main" class="main-view"></router-view>

    <FriendChat v-show="showFriendChat"></FriendChat>

    <NewFriend v-show="showNewFriend"></NewFriend>

    <friendDetail v-show="showFriendDetail"></friendDetail>

    <!-- 右侧内容区：设置页保持原有 setting 子路由 -->
    <router-view v-show="showSettingView" name="setting" class="setting-view"></router-view>

    <AddFriend v-show="$store.state.addFriendPage"></AddFriend>
    <CreateGroup v-show="$store.state.createGroupPage"></CreateGroup>
    <ChatNote v-show="$store.state.chatNotePage"></ChatNote>
    <Avatar v-show="$store.state.avatarPage"></Avatar>
    
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'
import AddFriend from '@/components/AddFriend.vue'
import CreateGroup from '@/components/CreateGroup.vue'
import FriendChat from '@/components/friend.vue'
import NewFriend from '@/components/NewFriend.vue'
import ChatNote from '@/components/ChatNote.vue'
import Avatar from '@/components/Avatar.vue'
import friendDetail from '@/components/friendDetail.vue'

export default {
  name: 'ChatRoom',
  components: {
    Nav,
    AddFriend,
    CreateGroup,
    FriendChat,
    NewFriend,
    ChatNote,
    Avatar,
    friendDetail
  },
  computed: {
    hasCurrentChatFriend () {
      const currentId = this.$store.state.currentChatFriendId
      if (currentId === null || currentId === undefined || currentId === '') return false
      return this.$store.state.chatFriendList.some(item => String(item.id) === String(currentId))
    },
    showFriendChat () {
      return this.$route.path === '/chathome/chat' &&
        this.$store.state.chatSubStatus === 'friend' &&
        this.hasCurrentChatFriend
    },
    showNewFriend () {
      return this.$route.path === '/chathome/friend' && this.$store.state.chatSubStatus === 'newfriend'
    },
    showFriendDetail () {
      return this.$route.path === '/chathome/friend' && this.$store.state.chatSubStatus === 'friend'
    },
    showSettingView () {
      return this.$route.path.indexOf('/chathome/setting') === 0
    }
  },
  created () {
    this.$axios({
      url: '/api/user/show/main',
      method: 'post'
    }).then(res => {
      if (res.data.err === "success") {
        this.$store.commit('setUserInfo', {
          name: res.data.user.name,
          gender: res.data.user.gender,
          picture: res.data.user.picture,
          pictureId: res.data.user.picture_id ?? res.data.user.pictureId,
          signature: res.data.user.signature,
          email: res.data.user.email
        })
      }
    })
    this.$axios({
      url: '/api/contact/list',
      method: 'post'
    }).then(res => {
      console.log(res)
      if (res.data.error === 'success') {
        this.$store.commit('setUserFriendList', res.data.list)
      }
    })
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