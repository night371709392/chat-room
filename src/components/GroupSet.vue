<template>
  <div v-if="groupId" class="group-set">
    <div class="panel-title">群聊设置</div>

    <div class="card profile-block">
      <div class="avatar-ring">
        <img :src="avatarSrc" alt="">
      </div>
      <div class="profile-name">{{ displayName }}</div>
    </div>

    <div class="card members-block">
      <div class="members-header">
        <span class="section-label">群成员</span>
        <div class="members-actions">
          <button type="button" class="member-btn" @click="onInviteMember">邀请</button>
          <button type="button" class="member-btn member-btn-remove" @click="onRemoveMember">移除</button>
        </div>
      </div>
      <div class="members-list">
        <div v-if="memberList.length === 0" class="members-empty">暂无成员数据</div>
        <div v-for="m in memberList" :key="m.person_id" class="member-item">
          <img :src="m.picture || defaultAvatar" class="member-avatar" alt="">
          <span class="member-name">{{ m.person_name || '-' }}</span>
        </div>
      </div>
    </div>

    <div class="card info-rows">
      <div class="info-row">
        <span class="label">群聊名称</span>
        <span class="value">{{ groupName }}</span>
      </div>
      <div class="info-row info-row-input">
        <span class="label">备注名</span>
        <input
          ref="remarkInput"
          v-model.trim="remarkDraft"
          type="text"
          class="text-input"
          maxlength="32"
          placeholder="填写备注名"
          autocomplete="off"
          @keydown.enter.prevent="onRemarkEnter"
          @blur="submitRemark"
        >
      </div>
      <div class="info-row info-row-input">
        <span class="label">我的昵称</span>
        <input
          ref="nicknameInput"
          v-model.trim="nicknameDraft"
          type="text"
          class="text-input"
          maxlength="32"
          placeholder="填写群昵称"
          autocomplete="off"
          @keydown.enter.prevent="onNicknameEnter"
          @blur="submitNickname"
        >
      </div>
    </div>

    <div class="card switch-rows">
      <div class="switch-row">
        <span class="switch-label">置顶聊天</span>
        <van-switch v-model="pinTop" size="20px" active-color="#3458DA" />
      </div>
      <div class="switch-row">
        <span class="switch-label">消息免打扰</span>
        <van-switch v-model="muteNotify" size="20px" active-color="#3458DA" />
      </div>
    </div>

    <div class="card action-rows">
      <button type="button" class="action-row" @click="onSearchChat">
        <span>查找聊天内容</span>
        <i class="ri ri-arrow-right-s-line"></i>
      </button>
      <button type="button" class="action-row" @click="onClearHistory">
        <span>清空聊天记录</span>
        <i class="ri ri-arrow-right-s-line"></i>
      </button>
    </div>

    <button type="button" class="btn-leave" @click="onLeaveGroup">退出群聊</button>
  </div>
</template>

<script>
import { Toast, Dialog } from 'vant'

const LS_PIN = 'groupSet_pinTop'
const LS_MUTE = 'groupSet_mute'

export default {
  name: 'GroupSet',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg',
      pinTop: false,
      muteNotify: false,
      remarkDraft: '',
      nicknameDraft: '',
      remarkSubmitting: false,
      nicknameSubmitting: false,
      memberList: []
    }
  },
  computed: {
    groupId () {
      const id = this.$store.state.currentChatFriendId
      if (id === null || id === undefined || id === '') return null
      return id
    },
    chatPeer () {
      const id = this.groupId
      if (id == null) return null
      return this.$store.state.chatFriendList.find(item => String(item.id) === String(id)) || null
    },
    detail () {
      const d = this.$store.state.currentFriendDetail
      if (!d || String(d.id) !== String(this.groupId)) return null
      return d
    },
    avatarSrc () {
      const a = (this.detail && this.detail.avatar) || (this.chatPeer && this.chatPeer.avatar)
      return a || this.defaultAvatar
    },
    displayName () {
      if (this.detail && this.detail.nickname) {
        return this.detail.nickname
      }
      if (this.chatPeer) {
        return this.chatPeer.nickname || this.chatPeer.username || '群聊'
      }
      return '群聊'
    },
    groupName () {
      if (this.detail && this.detail.username) return this.detail.username
      if (this.chatPeer && this.chatPeer.username) return this.chatPeer.username
      return '-'
    }
  },
  watch: {
    groupId: {
      immediate: true,
      handler () {
        this.loadTogglePrefs()
        this.syncDrafts()
      }
    },
    visible (v) {
      if (v && this.groupId) {
        this.fetchGroupInfo()
        this.$nextTick(() => this.syncDrafts())
      }
    },
    pinTop () {
      this.persistToggles()
    },
    muteNotify () {
      this.persistToggles()
    }
  },
  methods: {
    storageKey (base) {
      return `${base}_${this.groupId}`
    },
    loadTogglePrefs () {
      const id = this.groupId
      if (id == null) {
        this.pinTop = false
        this.muteNotify = false
        return
      }
      try {
        this.pinTop = sessionStorage.getItem(this.storageKey(LS_PIN)) === '1'
        this.muteNotify = sessionStorage.getItem(this.storageKey(LS_MUTE)) === '1'
      } catch (e) {
        this.pinTop = false
        this.muteNotify = false
      }
    },
    persistToggles () {
      const id = this.groupId
      if (id == null) return
      try {
        sessionStorage.setItem(this.storageKey(LS_PIN), this.pinTop ? '1' : '0')
        sessionStorage.setItem(this.storageKey(LS_MUTE), this.muteNotify ? '1' : '0')
      } catch (e) {
        void e
      }
    },
    syncDrafts () {
      const d = this.detail
      if (d) {
        const remark = d.remark != null && d.remark !== '-' ? String(d.remark).trim() : ''
        this.remarkDraft = remark
        const nick = d.my_nickname != null && d.my_nickname !== '-' ? String(d.my_nickname).trim() : ''
        this.nicknameDraft = nick
      } else if (this.chatPeer) {
        this.remarkDraft = ''
        this.nicknameDraft = ''
      }
    },
    fetchGroupInfo () {
      const id = this.groupId
      if (id == null) return
      this.$axios.post('/api/group/one/main', {
        group_id: Number(id)
      }).then(res => {
        const data = res.data
        if (data && (data.error === 'success' || data.err === 'success')) {
          const raw = data.group || {}
          const detail = this.detail || {}
          const merged = {
            ...detail,
            username: raw.group_name || raw.name || detail.username || '',
            remark: raw.group_rename || raw.remark || raw.group_re_name || '',
            my_nickname: raw.user_rename || raw.nickname || ''
          }
          this.$store.commit('setCurrentFriendDetail', merged)
          this.$nextTick(() => this.syncDrafts())
        }
      }).catch(err => {
        console.warn('[GroupSet] fetchGroupInfo', err)
      })

      this.$axios.post('/api/group/show/all', {
        group_id: Number(id)
      }).then(res => {
        const data = res.data
        if (data && (data.error === 'success' || data.err === 'success')) {
          this.memberList = Array.isArray(data.group_person) ? data.group_person : []
        }
      }).catch(err => {
        console.warn('[GroupSet] fetchMembers', err)
      })
    },
    apiResponseOk (data) {
      if (data === 'success') return true
      if (!data || typeof data !== 'object') return false
      return data.error === 'success' || data.err === 'success'
    },
    onRemarkEnter () {
      const el = this.$refs.remarkInput
      if (el) el.blur()
    },
    onNicknameEnter () {
      const el = this.$refs.nicknameInput
      if (el) el.blur()
    },
    submitRemark () {
      const gid = this.groupId
      if (gid == null) return
      if (this.remarkSubmitting) return
      const remark = (this.remarkDraft || '').trim()

      const cur = this.detail
      const prevRemark = cur ? (cur.remark || '') : ''
      if (remark === prevRemark) return

      this.remarkSubmitting = true
      this.$store.commit('applyGroupRemark', { groupId: gid, remark })
      this.$axios({
        url: '/api/group/change/re/name',
        method: 'post',
        data: {
          group_id: Number(gid),
          group_rename: remark
        }
      }).then(res => {
        if (!this.apiResponseOk(res.data)) {
          this.$store.commit('applyGroupRemark', { groupId: gid, remark: prevRemark })
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '保存失败'
          Toast.fail(msg)
          return
        }
        Toast.success('备注已保存')
      }).catch(() => {
        this.$store.commit('applyGroupRemark', { groupId: gid, remark: prevRemark })
        Toast.fail('网络异常，请稍后重试')
      }).finally(() => {
        this.remarkSubmitting = false
      })
    },
    submitNickname () {
      const gid = this.groupId
      if (gid == null) return
      if (this.nicknameSubmitting) return
      const nickname = (this.nicknameDraft || '').trim()

      const cur = this.detail
      const prevNickname = cur ? (cur.my_nickname || '') : ''
      if (nickname === prevNickname) return

      this.nicknameSubmitting = true
      this.$store.commit('applyGroupNickname', { groupId: gid, nickname })
      this.$axios({
        url: '/api/group/change/user/rename',
        method: 'post',
        data: {
          group_id: Number(gid),
          user_rename: nickname
        }
      }).then(res => {
        if (!this.apiResponseOk(res.data)) {
          this.$store.commit('applyGroupNickname', { groupId: gid, nickname: prevNickname })
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '保存失败'
          Toast.fail(msg)
          return
        }
        Toast.success('昵称已保存')
      }).catch(() => {
        this.$store.commit('applyGroupNickname', { groupId: gid, nickname: prevNickname })
        Toast.fail('网络异常，请稍后重试')
      }).finally(() => {
        this.nicknameSubmitting = false
      })
    },
    onInviteMember () {
      Toast('邀请功能开发中')
    },
    onRemoveMember () {
      Toast('移除成员功能开发中')
    },
    onSearchChat () {
      this.$store.commit('setCurrentChatFriendId', this.groupId)
      this.$store.commit('openChatNotePage')
      this.$emit('close')
    },
    onClearHistory () {
      Dialog.confirm({
        title: '清空聊天记录',
        message: '确定清空该群聊的本地会话记录？（仅本设备）',
        confirmButtonColor: '#3458DA'
      }).then(() => {
        this.$store.commit('clearMessagesForFriend', this.groupId)
        Toast.success('已清空')
      }).catch(() => {
        void 0
      })
    },
    onLeaveGroup () {
      Dialog.confirm({
        title: '退出群聊',
        message: '确定退出该群聊？退出后将不再接收此群聊的消息。',
        confirmButtonColor: '#f56c6c'
      }).then(() => {
        Toast.success('已退出群聊')
      }).catch(() => {
        void 0
      })
    }
  }
}
</script>

<style scoped>
.group-set {
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 14px 12px 20px;
  overflow-y: auto;
  background: #f0f1f4;
  box-sizing: border-box;
}
.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2430;
  text-align: center;
  margin-bottom: 14px;
  letter-spacing: 0.02em;
}
.card {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.profile-block {
  padding: 20px 16px;
  text-align: center;
}
.avatar-ring {
  width: 88px;
  height: 88px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(52, 88, 218, 0.15);
}
.avatar-ring img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-name {
  font-size: 17px;
  font-weight: 600;
  color: #1f2430;
}

.members-block {
  padding: 12px 14px;
}
.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.section-label {
  font-size: 14px;
  color: #909399;
}
.members-actions {
  display: flex;
  gap: 8px;
}
.member-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #3458DA;
  border-radius: 6px;
  background: #fff;
  color: #3458DA;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.member-btn:hover {
  background: #eef1fc;
}
.member-btn-remove {
  border-color: #e6a23c;
  color: #e6a23c;
}
.member-btn-remove:hover {
  background: #fdf6ec;
}
.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.members-empty {
  font-size: 13px;
  color: #c0c4cc;
  padding: 6px 0;
}
.member-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: #f8f9fc;
  border-radius: 20px;
}
.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.member-name {
  font-size: 13px;
  color: #303133;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-rows {
  padding: 4px 0;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f1f4;
  font-size: 14px;
}
.info-row:last-child {
  border-bottom: none;
}
.info-row .label {
  color: #909399;
  flex-shrink: 0;
}
.info-row .value {
  color: #303133;
  max-width: 60%;
  text-align: right;
  word-break: break-all;
}
.info-row-input {
  gap: 10px;
}
.info-row-input .text-input {
  flex: 1;
  min-width: 0;
  max-width: 62%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  font-size: 14px;
  color: #303133;
  background: #fff;
  box-sizing: border-box;
}
.info-row-input .text-input:hover {
  border-color: #c0c4cc;
}
.info-row-input .text-input:focus {
  outline: none;
  border-color: #3458DA;
}

.switch-rows {
  padding: 4px 0;
}
.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f1f4;
}
.switch-row:last-child {
  border-bottom: none;
}
.switch-label {
  font-size: 14px;
  color: #303133;
}

.action-rows {
  padding: 0;
}
.action-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border: none;
  border-bottom: 1px solid #f0f1f4;
  background: transparent;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  text-align: left;
}
.action-row:last-child {
  border-bottom: none;
}
.action-row:hover {
  background: #fafbfc;
}
.action-row .ri {
  font-size: 18px;
  color: #c0c4cc;
}

.btn-leave {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #fff;
  font-size: 15px;
  color: #f56c6c;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.btn-leave:hover {
  background: #fff5f5;
}
</style>
