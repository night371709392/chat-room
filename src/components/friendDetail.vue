<template>
  <div class="friend-detail">
    <div class="profile-card" v-if="friend">
      <div class="avatar-wrap">
        <img :src="friend.avatar || defaultAvatar" alt="好友头像">
      </div>
      <h2 class="name">{{ friend.username || '-' }}</h2>

      <div class="base-info">
        <div class="info-item">
          <span class="label">用户名(ID)</span>
          <span class="value">{{ friend.username || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">昵称</span>
          <span class="value">{{ friend.nickname || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别</span>
          <span class="value">{{ friend.gender || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">个性签名</span>
          <span class="value">{{ friend.signature || '-' }}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" type="button" @click="goChatPage">发消息</button>
        <button class="btn btn-danger" type="button">删除好友</button>
      </div>
    </div>

    <div class="empty" v-else>
      <p>请选择一个好友查看详情</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FriendDetail',
  computed: {
    friend () {
      return this.$store.state.currentFriendDetail
    }
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    }
  },
  methods: {
    goChatPage () {
      if (!this.friend) return
      this.$store.commit('openFriendChat', this.friend)
      this.$store.commit('setChatSubStatus', 'friend')
      this.$router.push('/chathome/chat')
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
.friend-detail {
  flex: 1;
  height: 100vh;
  background: #f3f4f8;
  /* 核心：让内容绝对居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}
.profile-card {
  width: 100%;
  max-width: 580px; /* 限制卡片最大宽度 */
  background: #ffffff; /* 白色卡片背景 */
  border-radius: 20px; /* 圆角 */
  padding: 40px 36px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); /* 柔和阴影 */
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-wrap {
  width: 120px;
  height: 120px;
  margin: 0 auto 10px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}
.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name {
  text-align: center;
  font-size: 38px;
  line-height: 1.1;
  font-weight: 600;
  margin: 20px 0;
  color: #1f2430;
}
.base-info {
  border-top: 1px solid #dfe3ef;
  padding-top: 14px;
  width: 100%;
  max-width: 520px;
}
.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  min-height: 30px;
  margin-bottom: 4px;
}
.label {
  width: 84px;
  color: #7f8798;
  font-size: 16px;
  flex-shrink: 0;
}
.value {
  color: #2b3040;
  font-size: 16px;
  word-break: break-all;
}
.actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 14px;
}
.btn {
  height: 40px;
  border: none;
  border-radius: 10px;
  min-width: 68px;
  padding: 0 14px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  transition: opacity .2s ease;
}
.btn:hover {
  opacity: .88;
}
.btn-primary {
  background: #2830d3;
}
.btn-danger {
  background: #f06074;
}
.empty {
  color: #8b90a0;
  font-size: 16px;
  width: 100%;
  text-align: center;
}
</style>