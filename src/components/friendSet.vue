<template>
  <div v-if="friendId" class="friend-set">
    <div class="panel-title">好友设置</div>

    <div class="card profile-block">
      <div class="avatar-ring">
        <img :src="avatarSrc" alt="">
      </div>
      <div class="profile-name">{{ displayName }}</div>
    </div>

    <div class="card info-rows">
      <div class="info-row info-row-remark">
        <span class="label">备注</span>
        <input
          v-model.trim="remarkDraft"
          type="text"
          class="remark-input"
          maxlength="32"
          placeholder="填写备注名"
          autocomplete="off"
          @keydown.enter.prevent="submitRemarkOnEnter"
        >
      </div>
      <div class="info-row">
        <span class="label">性别</span>
        <span class="value">{{ genderText }}</span>
      </div>
      <div class="info-row">
        <span class="label">地区</span>
        <span class="value">{{ regionText }}</span>
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

    <button type="button" class="btn-delete" @click="onDeleteFriend">删除好友</button>
  </div>
</template>

<script>
import { Toast, Dialog } from 'vant'

const LS_PIN = 'friendSet_pinTop'
const LS_MUTE = 'friendSet_mute'

export default {
  name: 'FriendSet',
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
      remarkSubmitting: false
    }
  },
  computed: {
    friendId () {
      const id = this.$store.state.currentChatFriendId
      if (id === null || id === undefined || id === '') return null
      return id
    },
    chatPeer () {
      const id = this.friendId
      if (id == null) return null
      return this.$store.state.chatFriendList.find(item => String(item.id) === String(id)) || null
    },
    detail () {
      const d = this.$store.state.currentFriendDetail
      if (!d || String(d.id) !== String(this.friendId)) return null
      return d
    },
    avatarSrc () {
      const a = (this.detail && this.detail.avatar) || (this.chatPeer && this.chatPeer.avatar)
      return a || this.defaultAvatar
    },
    displayName () {
      if (this.detail && (this.detail.nickname || this.detail.username)) {
        return this.detail.nickname || this.detail.username
      }
      if (this.chatPeer) {
        return this.chatPeer.nickname || this.chatPeer.username || '好友'
      }
      return '好友'
    },
    genderText () {
      const g = this.detail && this.detail.gender
      return g || '—'
    },
    regionText () {
      const d = this.detail
      if (!d) return '—'
      const p = d.province ?? d.region ?? ''
      const c = d.city ?? ''
      const s = [p, c].filter(Boolean).join(' ')
      return s || '—'
    }
  },
  watch: {
    friendId: {
      immediate: true,
      handler () {
        this.loadTogglePrefs()
        this.syncRemarkDraft()
      }
    },
    visible (v) {
      if (v && this.friendId) {
        this.$store.dispatch('fetchFriendDetailPanel', { friendId: this.friendId })
        this.$nextTick(() => this.syncRemarkDraft())
      }
    },
    '$store.state.friendDetailLoading' (loading) {
      if (!loading && this.visible && this.friendId) {
        this.syncRemarkDraft()
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
      return `${base}_${this.friendId}`
    },
    loadTogglePrefs () {
      const id = this.friendId
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
      const id = this.friendId
      if (id == null) return
      try {
        sessionStorage.setItem(this.storageKey(LS_PIN), this.pinTop ? '1' : '0')
        sessionStorage.setItem(this.storageKey(LS_MUTE), this.muteNotify ? '1' : '0')
      } catch (e) {
        void e
      }
    },
    syncRemarkDraft () {
      let s = ''
      if (this.detail) {
        const t = this.detail.remark || this.detail.friend_remark || this.detail.nickname
        s = t != null && t !== '—' ? String(t).trim() : ''
      } else if (this.chatPeer && this.chatPeer.nickname) {
        s = String(this.chatPeer.nickname).trim()
      }
      this.remarkDraft = s
    },
    remarkResponseOk (data) {
      if (data === 'success') return true
      if (!data || typeof data !== 'object') return false
      return data.error === 'success' || data.err === 'success'
    },
    submitRemarkOnEnter () {
      const fid = this.friendId
      if (fid === null || fid === undefined || fid === '') return
      if (this.remarkSubmitting) return
      const friendIdNum = Number(fid)
      const friend_id = Number.isFinite(friendIdNum) ? friendIdNum : fid
      const remark = (this.remarkDraft || '').trim()
      this.remarkSubmitting = true

      this.$axios({
        url: '/api/contact/change/remark',
        method: 'post',
        data: {
          friend_id,
          remark
        }
      })
        .then(res => {
          if (!this.remarkResponseOk(res.data)) {
            const msg =
              res.data && typeof res.data === 'object' && (res.data.msg || res.data.message)
                ? res.data.msg || res.data.message
                : '保存失败'
            Toast.fail(msg)
            return
          }
          this.$store.commit('applyFriendRemark', { friendId: friend_id, remark })
          Toast.success('备注已保存')
        })
        .catch(() => {
          Toast.fail('网络异常，请稍后重试')
        })
        .finally(() => {
          this.remarkSubmitting = false
        })
    },
    onSearchChat () {
      this.$store.commit('setCurrentChatFriendId', this.friendId)
      this.$store.commit('openChatNotePage')
      this.$emit('close')
    },
    onClearHistory () {
      Dialog.confirm({
        title: '清空聊天记录',
        message: '确定清空与该好友的本地会话记录？（仅本设备）',
        confirmButtonColor: '#3458DA'
      })
        .then(() => {
          this.$store.commit('clearMessagesForFriend', this.friendId)
          Toast.success('已清空')
        })
        .catch(() => {
          void 0
        })
    },
    onDeleteFriend () {
      Dialog.alert({
        title: '删除好友',
        message: '删除好友需对接服务端接口，此处为占位提示。',
        confirmButtonText: '知道了',
        confirmButtonColor: '#3458DA'
      })
    }
  }
}
</script>

<style scoped>
.friend-set {
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
}
.info-row .value {
  color: #303133;
  max-width: 60%;
  text-align: right;
  word-break: break-all;
}
.info-row-remark {
  gap: 10px;
}
.info-row-remark .remark-input {
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
.info-row-remark .remark-input:hover {
  border-color: #c0c4cc;
}
.info-row-remark .remark-input:focus {
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
.btn-delete {
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
.btn-delete:hover {
  background: #fff5f5;
}
</style>
