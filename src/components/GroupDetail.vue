<template>
  <div class="group-detail">
    <div class="profile-card" v-if="group">
      <div class="avatar-wrap">
        <img :src="group.group_picture || defaultAvatar" alt="群头像">
      </div>
      <h2 class="name">{{ groupDisplayName }}</h2>

      <div class="base-info-wrap">
        <div class="base-info">
          <div class="info-item">
            <span class="label">群主</span>
            <span class="value">{{ group.owner_name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">群名</span>
            <span class="value">{{ groupDisplayName }}</span>
          </div>
          <div class="info-item">
            <span class="label">备注名</span>
            <span class="value">{{ group.remark || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">我的昵称</span>
            <span class="value">{{ group.my_nickname || '-' }}</span>
          </div>
        </div>
        <div v-if="detailLoading" class="base-info-loading" aria-busy="true">
          <span class="loading-text">加载中…</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" type="button" @click="sendMessage">发消息</button>
        <button class="btn btn-danger" type="button" @click="leaveGroup">退出群聊</button>
      </div>
    </div>

    <div class="empty" v-else>
      <p>请选择一个群聊查看详情</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroupDetail',
  computed: {
    group () {
      return this.$store.state.currentGroupDetail
    },
    detailLoading () {
      return this.$store.state.groupDetailLoading
    },
    groupDisplayName () {
      const g = this.group
      if (!g) return '-'
      return String(g.group_name ?? g.name ?? '').trim() || '-'
    }
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    }
  },
  methods: {
    sendMessage () {
      if (!this.group) return
      const g = this.group
      const groupId = g.group_id
      if (!groupId && groupId !== 0) return
      const chatEntry = {
        id: groupId,
        type: 'group',
        username: g.group_name || g.name || '',
        avatar: g.group_picture || g.picture || g.avatar || '',
        nickname: g.group_name || g.name || ''
      }
      this.$store.commit('setCurrentFriendDetail', chatEntry)
      this.$store.commit('openFriendChat', chatEntry)
      this.$store.commit('setChatSubStatus', 'friend')
      if (this.$route.path !== '/chathome/chat') {
        this.$router.push('/chathome/chat')
      }
    },
    leaveGroup () {
      if (!this.group) return
      console.log('[GroupDetail] 退出群聊', this.group)
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
.group-detail {
  flex: 1;
  height: 100vh;
  background: #f3f4f8;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}
.profile-card {
  width: 100%;
  max-width: 580px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
.base-info-wrap {
  position: relative;
  width: 100%;
  max-width: 520px;
}
.base-info {
  border-top: 1px solid #dfe3ef;
  padding-top: 14px;
  width: 100%;
}
.base-info-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 8px;
  pointer-events: none;
}
.loading-text {
  font-size: 15px;
  color: #5c6370;
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
.btn-primary {
  background: #2830d3;
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
