<template>
  <div v-if="friendDetail" class="item" :class="{ active: isActive }" @click="openFriendChat">
    <div class="head-image">
      <img :src="friendDetail.avatar || defaultAvatar" alt="">
    </div>
    <div class="right">
      <div class="name-text">
        <p>{{ friendDetail.username || friendDetail.nickname || '-' }}</p>
        <span>刚刚</span>
      </div>
      <div class="content-text">{{ friendDetail.signature || '你们已成为好友，现在可以开始聊天了' }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactItem',
  props: {
    friendDetail: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    }
  },
  computed: {
    activeSubStatus () {
      return this.$store.state.chatSubStatus
    },
    isActive () {
      if (!this.friendDetail) return false
      return this.activeSubStatus === 'friend' && String(this.$store.state.currentChatFriendId) === String(this.friendDetail.id)
    }
  },
  methods: {
    openFriendChat () {
      if (!this.friendDetail) return
      this.$store.commit('setCurrentFriendDetail', this.friendDetail)
      this.$store.commit('setCurrentChatFriendId', this.friendDetail.id)
      this.$store.commit('setChatSubStatus', 'friend')
    }
  }
}
</script>

<style scoped>
.item {
  height: 64px;
  display: flex;
  position: relative;
  margin: 0 3px;
  padding: 5px 8px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 10px;
  user-select: none;
}
.item:hover {
  background-color: #e8f3ff;
}
.item .head-image {
  width: 45px;
  height: 45px;
}
.item .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.item .right {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding-left: 10px;
  text-align: left;
  overflow: hidden;
}
.item .right .name-text {
  display: flex;
  justify-content: space-between;
}
.item .right .name-text p {
  font-size: 14px;
  color: black;
}
.item .right .name-text span {
  font-size: 12px;
  color: #808080;
}
.item .right .content-text {
  font-size: 12px;
  color: #808080;
  overflow: hidden;
}
.item.active {
  background-color: #e8f3ff !important;
  border-left: 3px solid #2830d3;
}
.item:hover {
  background-color: #f5f7fa;
  cursor: pointer;
}
</style>