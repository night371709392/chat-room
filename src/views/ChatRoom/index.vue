<template>
  <div class="chatroom">
    <Nav></Nav>
    <!-- 二级路由渲染区：聊天/好友/群聊/设置入口 -->
    <router-view name="main" class="main-view"></router-view>

    <FriendChat v-show="showFriendChat"></FriendChat>

    <NewFriend v-show="showNewFriend"></NewFriend>

    <friendDetail v-show="showFriendDetail"></friendDetail>

    <GroupDetail v-show="showGroupDetail"></GroupDetail>

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
import GroupDetail from '@/components/GroupDetail.vue'

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
    friendDetail,
    GroupDetail
  },
  computed: {
    hasCurrentChatFriend () {
      const currentId = this.$store.state.currentChatFriendId
      if (currentId === null || currentId === undefined || currentId === '') return false
      if (this.$store.state.chatFriendList.some(item => String(item.id) === String(currentId))) return true
      return this.$store.state.chatFriendList.length === 0
    },
    showFriendChat () {
      return this.$route.path === '/chathome/chat' &&
        this.$store.state.chatSubStatus === 'friend' &&
        this.hasCurrentChatFriend
    },
    showNewFriend () {
      return this.$route.path === '/chathome/friend' && this.$store.state.chatSubStatus === 'newfriend'
    },
    /** 仅通讯录内主动查看资料（与会话列表的 chatSubStatus=friend 区分，避免从聊天切到通讯录误开详情） */
    showFriendDetail () {
      return this.$route.path === '/chathome/friend' && this.$store.state.chatSubStatus === 'friendDetail'
    },
    showGroupDetail () {
      return this.$route.path === '/chathome/group' && this.$store.state.chatSubStatus === 'groupDetail'
    },
    showSettingView () {
      return this.$route.path.indexOf('/chathome/setting') === 0
    }
  },
  watch: {
    '$route.path' (to) {
      if (to === '/chathome/friend') {
        if (this.$store.state.chatSubStatus === 'friend') {
          this.$store.commit('setChatSubStatus', '')
          this.$store.commit('setCurrentFriendDetail', null)
          this.$store.commit('setFriendDetailLoading', false)
        }
        return
      }
      if (to === '/chathome/group') {
        this.$store.commit('setChatSubStatus', '')
        this.$store.commit('setCurrentGroupDetail', null)
        this.$store.commit('setGroupDetailLoading', false)
        return
      }
      if (to === '/chathome/chat') {
        const id = this.$store.state.currentChatFriendId
        const hasFriend = id != null && id !== ''
        if (hasFriend && this.$store.state.chatSubStatus === 'friendDetail') {
          this.$store.commit('setChatSubStatus', 'friend')
        }
      }
    }
  },
  created () {
    this.$store.commit('restoreMessagesFromSession')

    try {
      const saved = JSON.parse(sessionStorage.getItem('chat_session'))
      if (saved && saved.currentChatFriendId) {
        if (saved.currentFriendDetail) {
          this.$store.commit('setCurrentFriendDetail', saved.currentFriendDetail)
        } else if (saved.chatType) {
          this.$store.commit('setCurrentFriendDetail', {
            id: String(saved.currentChatFriendId),
            type: saved.chatType
          })
        }
        this.$store.commit('setCurrentChatFriendId', saved.currentChatFriendId)
        this.$store.commit('setChatSubStatus', saved.chatSubStatus || 'friend')
      }
    } catch (_) { /* sessionStorage 读取失败，忽略 */ }

    this.$axios({
      url: '/api/user/show/main',
      method: 'post'
    }).then(res => {
      if (res.data.err === "success") {
        const u = res.data.user
        this.$store.commit('setUserInfo', {
          name: u.name,
          gender: u.gender,
          picture: u.picture,
          pictureId: u.picture_id ?? u.pictureId,
          signature: u.signature,
          email: u.email
        })
        const uid = u.id ?? u.user_id ?? u.userId
        if (uid !== undefined && uid !== null && uid !== '') {
          this.$store.commit('setUserId', uid)
        }
      }
    })
    this.$axios({
      url: '/api/contact/list',
      method: 'get'
    }).then(res => {
      if (res.data.error === 'success') {
        this.$store.commit('setUserFriendList', res.data.list)
      }
    })

    this.$store.dispatch('fetchGroupList').then(() => {
      const groups = this.$store.state.userGroupList || []
      for (const g of groups) {
        const gid = String(g.group_id ?? g.id)
        if (!gid) continue
        const msgs = this.$store.state.messagesByFriend[gid] || []
        if (msgs.length > 0) continue
        this.$store.dispatch('fetchGroupChatHistory', { groupId: gid })
      }
    })

    this.$axios({
      url: '/api/chat/show/all',
      method: 'get'
    }).then(res => {
      if (res.data.error !== 'success') return
      const raw = res.data.list || []
      const chatList = raw.map(item => {
        const isGroup = !!(item.group_id)
        return {
          id: item.friend_id || item.group_id || item.id,
          type: isGroup ? 'group' : 'friend',
          username: item.friend_name || item.group_name || '',
          avatar: item.friend_picture || item.group_picture || '',
          nickname: item.friend_name || item.group_name || '',
          last_msg: item.last_msg || item.latest_msg || '',
          last_msg_time: item.last_msg_time || item.latest_msg_time || item.time || ''
        }
      })
      this.$store.commit('setChatFriendList', chatList)
      this.$store.commit('sortChatFriendList')

      for (const item of chatList) {
        const id = String(item.id)
        const msgs = this.$store.state.messagesByFriend[id] || []
        if (msgs.length > 0) continue
        if (item.type === 'group') {
          this.$store.dispatch('fetchGroupChatHistory', { groupId: item.id })
        } else {
          this.$store.dispatch('fetchChatHistory', { friendId: item.id })
        }
      }

      const cid2 = this.$store.state.currentChatFriendId
      if (cid2 != null && cid2 !== '') {
        const target = chatList.find(item => String(item.id) === String(cid2))
        if (target) {
          this.$store.commit('setCurrentFriendDetail', target)
        }
      }
    })
  },
  methods: {
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