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
  margin: 2px 6px;
  padding: 6px 10px 6px 12px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 12px;
  user-select: none;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.item:hover:not(.active) {
  background-color: #f0f4fa;
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
  background: linear-gradient(105deg, rgba(66, 103, 214, 0.14) 0%, rgba(66, 103, 214, 0.05) 52%, rgba(255, 255, 255, 0) 100%) !important;
  box-shadow: inset 0 0 0 1px rgba(66, 103, 214, 0.22);
}
.item.active::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(180deg, #5b73e8 0%, #3d52d4 100%);
  box-shadow: 0 2px 10px rgba(61, 82, 212, 0.45);
}
.item.active .right .name-text p {
  color: #1a1d24;
  font-weight: 600;
}
</style>