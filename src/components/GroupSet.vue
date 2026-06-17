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
          <button v-if="canManage" type="button" class="member-btn member-btn-remove" @click="onRemoveMember">移除</button>
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

    <button v-if="isLeader" type="button" class="btn-transfer" @click="onTransferLeader">转让群主</button>

    <button v-if="isLeader" type="button" class="btn-transfer" @click="onSetAdmin">设置管理员</button>

    <button v-if="isLeader" type="button" class="btn-dismiss" @click="onDismissGroup">解散群聊</button>

    <van-popup
      v-model="inviteVisible"
      round
      position="center"
      :style="{ width: '340px' }"
      @closed="inviteSelectedIds = []"
    >
      <div class="invite-dialog">
        <div class="invite-title">邀请好友入群</div>
        <div class="invite-body">
          <div v-if="inviteLoading" class="invite-empty">加载中...</div>
          <div v-else-if="inviteCandidates.length === 0" class="invite-empty">暂无可邀请的好友</div>
          <label
            v-for="f in inviteCandidates"
            :key="f.friend_id"
            class="invite-item"
            :class="{ selected: isInviteSelected(f.friend_id) }"
          >
            <input
              type="checkbox"
              class="invite-check"
              :checked="isInviteSelected(f.friend_id)"
              @change="toggleInviteSelect(f.friend_id)"
            >
            <img :src="f.friend_picture || defaultAvatar" class="invite-avatar" alt="">
            <span class="invite-name">{{ inviteFriendName(f) }}</span>
          </label>
        </div>
        <div class="invite-footer">
          <button type="button" class="invite-btn cancel" @click="closeInvite">取消</button>
          <button
            type="button"
            class="invite-btn confirm"
            :disabled="inviting || inviteSelectedIds.length === 0"
            @click="confirmInvite"
          >确定{{ inviteSelectedIds.length ? `(${inviteSelectedIds.length})` : '' }}</button>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model="removeVisible"
      round
      position="center"
      :style="{ width: '340px' }"
      @closed="removeSelectedIds = []"
    >
      <div class="invite-dialog">
        <div class="invite-title">移除群成员</div>
        <div class="invite-body">
          <div v-if="removableMembers.length === 0" class="invite-empty">暂无可移除的成员</div>
          <label
            v-for="m in removableMembers"
            :key="m.person_id"
            class="invite-item"
            :class="{ selected: isRemoveSelected(m.person_id) }"
          >
            <input
              type="checkbox"
              class="invite-check"
              :checked="isRemoveSelected(m.person_id)"
              @change="toggleRemoveSelect(m.person_id)"
            >
            <img :src="m.picture || defaultAvatar" class="invite-avatar" alt="">
            <span class="invite-name">{{ memberName(m) }}</span>
          </label>
        </div>
        <div class="invite-footer">
          <button type="button" class="invite-btn cancel" @click="closeRemove">取消</button>
          <button
            type="button"
            class="invite-btn confirm"
            :disabled="removing || removeSelectedIds.length === 0"
            @click="confirmRemove"
          >确定{{ removeSelectedIds.length ? `(${removeSelectedIds.length})` : '' }}</button>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model="transferVisible"
      round
      position="center"
      :style="{ width: '340px' }"
      @closed="transferSelectedId = null"
    >
      <div class="invite-dialog">
        <div class="invite-title">转让群主</div>
        <div class="invite-body">
          <div v-if="transferCandidates.length === 0" class="invite-empty">暂无可转让的成员</div>
          <label
            v-for="m in transferCandidates"
            :key="m.person_id"
            class="invite-item"
            :class="{ selected: isTransferSelected(m.person_id) }"
          >
            <input
              type="radio"
              class="invite-check"
              name="transfer-leader"
              :checked="isTransferSelected(m.person_id)"
              @change="selectTransfer(m.person_id)"
            >
            <img :src="m.picture || defaultAvatar" class="invite-avatar" alt="">
            <span class="invite-name">{{ memberName(m) }}</span>
          </label>
        </div>
        <div class="invite-footer">
          <button type="button" class="invite-btn cancel" @click="closeTransfer">取消</button>
          <button
            type="button"
            class="invite-btn confirm"
            :disabled="transferring || transferSelectedId == null"
            @click="confirmTransfer"
          >确认转让</button>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model="adminVisible"
      round
      position="center"
      :style="{ width: '340px' }"
      @closed="adminSelectedIds = []"
    >
      <div class="invite-dialog">
        <div class="invite-title">设置管理员</div>
        <div class="invite-tip">每个群最多 {{ maxAdmin }} 个管理员，当前 {{ currentAdminCount }} 个</div>
        <div class="invite-body">
          <div v-if="adminCandidates.length === 0" class="invite-empty">暂无可设置的成员</div>
          <label
            v-for="m in adminCandidates"
            :key="m.person_id"
            class="invite-item"
            :class="{ selected: isAdminSelected(m.person_id) }"
          >
            <input
              type="checkbox"
              class="invite-check"
              :checked="isAdminSelected(m.person_id)"
              @change="toggleAdminSelect(m.person_id)"
            >
            <img :src="m.picture || defaultAvatar" class="invite-avatar" alt="">
            <span class="invite-name">{{ memberName(m) }}</span>
          </label>
        </div>
        <div class="invite-footer">
          <button type="button" class="invite-btn cancel" @click="closeAdmin">取消</button>
          <button
            type="button"
            class="invite-btn confirm"
            :disabled="settingAdmin || adminSelectedIds.length === 0"
            @click="confirmAdmin"
          >确定{{ adminSelectedIds.length ? `(${adminSelectedIds.length})` : '' }}</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Toast, Dialog } from 'vant'

const LS_PIN = 'groupSet_pinTop'
const LS_MUTE = 'groupSet_mute'

// 群成员角色：1=普通成员，2=管理员，3=群主
const ROLE_MEMBER = 1
const ROLE_ADMIN = 2
const ROLE_LEADER = 3
const MAX_ADMIN = 2

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
      inviteVisible: false,
      inviteFriends: [],
      inviteSelectedIds: [],
      inviteLoading: false,
      inviting: false,
      removeVisible: false,
      removeSelectedIds: [],
      removing: false,
      transferVisible: false,
      transferSelectedId: null,
      transferring: false,
      leaving: false,
      dismissing: false,
      adminVisible: false,
      adminSelectedIds: [],
      settingAdmin: false
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
    },
    memberList () {
      const id = this.groupId
      if (id == null) return []
      return this.$store.state.groupMembersByGroup[String(id)] || []
    },
    myRole () {
      const myId = this.$store.state.userId
      if (myId == null) return null
      const me = this.memberList.find(m => String(m.person_id) === String(myId))
      return me && me.role != null ? Number(me.role) : null
    },
    inviteCandidates () {
      const memberIds = new Set(
        (this.memberList || []).map(m => String(m.person_id))
      )
      return (this.inviteFriends || []).filter(
        f => !memberIds.has(String(f.friend_id))
      )
    },
    canManage () {
      return this.myRole != null && Number(this.myRole) !== ROLE_MEMBER
    },
    removableMembers () {
      const myId = this.$store.state.userId
      return (this.memberList || []).filter(
        m => String(m.person_id) !== String(myId)
      )
    },
    isLeader () {
      return this.myRole != null && Number(this.myRole) === ROLE_LEADER
    },
    transferCandidates () {
      const myId = this.$store.state.userId
      return (this.memberList || []).filter(
        m => String(m.person_id) !== String(myId)
      )
    },
    // 当前管理员数量：role === 2
    currentAdminCount () {
      return (this.memberList || []).filter(
        m => m.role != null && Number(m.role) === ROLE_ADMIN
      ).length
    },
    maxAdmin () {
      return MAX_ADMIN
    },
    // 可设为管理员的候选：普通成员(role===1)，已是管理员/群主的会被跳过
    adminCandidates () {
      const myId = this.$store.state.userId
      return (this.memberList || []).filter(m => {
        if (String(m.person_id) === String(myId)) return false
        const r = m.role != null ? Number(m.role) : ROLE_MEMBER
        return Number(r) === ROLE_MEMBER
      })
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

      this.$store.dispatch('fetchGroupMembers', { groupId: Number(id) })
    },
    apiResponseOk (data) {
      if (data === 'success') return true
      if (!data || typeof data !== 'object') return false
      return data.error === 'success' || data.err === 'success' || data.message === 'success'
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
      this.inviteSelectedIds = []
      this.inviteVisible = true
      this.loadInviteFriends()
    },
    loadInviteFriends () {
      const cached = this.$store.state.userFriendList
      if (Array.isArray(cached) && cached.length) {
        this.inviteFriends = cached
        return
      }
      this.inviteLoading = true
      this.$axios({
        url: '/api/contact/list',
        method: 'get'
      }).then(res => {
        if (res.data && res.data.error === 'success') {
          const list = Array.isArray(res.data.list) ? res.data.list : []
          this.inviteFriends = list
          this.$store.commit('setUserFriendList', list)
        } else {
          Toast.fail('获取好友列表失败')
        }
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
      }).finally(() => {
        this.inviteLoading = false
      })
    },
    inviteFriendName (f) {
      const r = String(f.friend_remark ?? f.remark ?? '').trim()
      return r || f.friend_name || '-'
    },
    toggleInviteSelect (friendId) {
      const id = friendId
      const idx = this.inviteSelectedIds.findIndex(x => String(x) === String(id))
      if (idx === -1) {
        this.inviteSelectedIds.push(id)
      } else {
        this.inviteSelectedIds.splice(idx, 1)
      }
    },
    isInviteSelected (friendId) {
      return this.inviteSelectedIds.some(x => String(x) === String(friendId))
    },
    closeInvite () {
      if (this.inviting) return
      this.inviteVisible = false
      this.inviteSelectedIds = []
    },
    confirmInvite () {
      const gid = this.groupId
      if (gid == null) return
      if (this.inviting) return
      if (!this.inviteSelectedIds.length) {
        Toast('请选择要邀请的好友')
        return
      }
      const personIds = this.inviteSelectedIds.map(id => Number(id))
      this.inviting = true
      this.$axios({
        url: '/api/group/readd/person',
        method: 'post',
        data: {
          group_id: Number(gid),
          person_id: personIds
        }
      }).then(res => {
        if (this.apiResponseOk(res.data)) {
          Toast.success('邀请成功')
          this.applyInviteLocally(personIds)
        } else {
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '邀请失败'
          Toast.fail(msg)
        }
        this.inviteVisible = false
        this.inviteSelectedIds = []
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
        this.inviteVisible = false
        this.inviteSelectedIds = []
      }).finally(() => {
        this.inviting = false
      })
    },
    applyInviteLocally (personIds) {
      const existing = new Set((this.memberList || []).map(m => String(m.person_id)))
      const additions = []
      personIds.forEach(pid => {
        if (existing.has(String(pid))) return
        const f = (this.inviteFriends || []).find(x => String(x.friend_id) === String(pid))
        additions.push({
          person_id: pid,
          person_name: f ? this.inviteFriendName(f) : '',
          picture: f ? f.friend_picture : '',
          role: 1
        })
      })
      if (additions.length) {
        this.$store.commit('addGroupMembers', { groupId: this.groupId, members: additions })
      }
    },
    applyRemoveLocally (personIds) {
      this.$store.commit('removeGroupMembers', { groupId: this.groupId, personIds })
    },
    onRemoveMember () {
      if (!this.canManage) {
        Toast('无移除权限')
        return
      }
      this.removeSelectedIds = []
      this.removeVisible = true
    },
    memberName (m) {
      return m.person_name || m.name || '-'
    },
    toggleRemoveSelect (personId) {
      const idx = this.removeSelectedIds.findIndex(x => String(x) === String(personId))
      if (idx === -1) {
        this.removeSelectedIds.push(personId)
      } else {
        this.removeSelectedIds.splice(idx, 1)
      }
    },
    isRemoveSelected (personId) {
      return this.removeSelectedIds.some(x => String(x) === String(personId))
    },
    closeRemove () {
      if (this.removing) return
      this.removeVisible = false
      this.removeSelectedIds = []
    },
    confirmRemove () {
      const gid = this.groupId
      if (gid == null) return
      if (this.removing) return
      if (!this.removeSelectedIds.length) {
        Toast('请选择要移除的成员')
        return
      }
      const personIds = this.removeSelectedIds.map(id => Number(id))
      this.removing = true
      this.$axios({
        url: '/api/group/delete/person',
        method: 'post',
        data: {
          group_id: Number(gid),
          person_id: personIds
        }
      }).then(res => {
        if (this.apiResponseOk(res.data)) {
          Toast.success('移除成功')
          this.applyRemoveLocally(personIds)
        } else {
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '移除失败'
          Toast.fail(msg)
        }
        this.removeVisible = false
        this.removeSelectedIds = []
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
        this.removeVisible = false
        this.removeSelectedIds = []
      }).finally(() => {
        this.removing = false
      })
    },
    onTransferLeader () {
      if (!this.isLeader) {
        Toast('只有群主可以转让群主')
        return
      }
      this.transferSelectedId = null
      this.transferVisible = true
    },
    selectTransfer (personId) {
      this.transferSelectedId = personId
    },
    isTransferSelected (personId) {
      return this.transferSelectedId != null &&
        String(this.transferSelectedId) === String(personId)
    },
    closeTransfer () {
      if (this.transferring) return
      this.transferVisible = false
      this.transferSelectedId = null
    },
    confirmTransfer () {
      const gid = this.groupId
      if (gid == null) return
      if (this.transferring) return
      if (this.transferSelectedId == null) {
        Toast('请选择新群主')
        return
      }
      const newLeaderId = Number(this.transferSelectedId)
      const target = (this.memberList || []).find(
        m => String(m.person_id) === String(newLeaderId)
      )
      if (!target) {
        Toast('新群主必须是群内成员')
        return
      }
      this.transferring = true
      this.$axios({
        url: '/api/group/change/leader',
        method: 'post',
        data: {
          group_id: Number(gid),
          new_leader_id: newLeaderId
        }
      }).then(res => {
        if (this.apiResponseOk(res.data)) {
          Toast.success('群主已转让')
          this.fetchGroupInfo()
        } else {
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '转让失败'
          Toast.fail(msg)
        }
        this.transferVisible = false
        this.transferSelectedId = null
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
        this.transferVisible = false
        this.transferSelectedId = null
      }).finally(() => {
        this.transferring = false
      })
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
      if (this.leaving) return
      // 群主无法直接退群，必须先转让群主
      if (this.isLeader) {
        Dialog.confirm({
          title: '退出群聊',
          message: '你是群主，无法直接退出。请先转让群主后再退出。',
          confirmButtonText: '去转让',
          confirmButtonColor: '#3458DA'
        }).then(() => {
          this.onTransferLeader()
        }).catch(() => {
          void 0
        })
        return
      }
      Dialog.confirm({
        title: '退出群聊',
        message: '确定退出该群聊？退出后将不再接收此群聊的消息。',
        confirmButtonColor: '#f56c6c'
      }).then(() => {
        this.quitGroup()
      }).catch(() => {
        void 0
      })
    },
    quitGroup () {
      const gid = this.groupId
      if (gid == null) return
      if (this.leaving) return
      this.leaving = true
      this.$axios({
        url: '/api/group/quit',
        method: 'post',
        data: {
          group_id: Number(gid)
        }
      }).then(res => {
        if (this.apiResponseOk(res.data)) {
          Toast.success('已退出群聊')
          this.applyQuitLocally(gid)
          this.$emit('close')
        } else {
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '退出失败'
          Toast.fail(msg)
        }
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
      }).finally(() => {
        this.leaving = false
      })
    },
    applyQuitLocally (groupId) {
      const gid = String(groupId)
      // 从会话列表移除
      const chatList = (this.$store.state.chatFriendList || [])
        .filter(item => String(item.id) !== gid)
      this.$store.commit('setChatFriendList', chatList)
      // 从用户群聊列表移除
      const groupList = (this.$store.state.userGroupList || [])
        .filter(g => String(g.group_id ?? g.id) !== gid)
      this.$store.commit('setUserGroupList', groupList)
      // 清空本地聊天记录
      this.$store.commit('clearMessagesForFriend', groupId)
      // 若当前正打开该群聊则清空选中
      if (String(this.$store.state.currentChatFriendId) === gid) {
        this.$store.commit('setCurrentChatFriendId', null)
      }
    },
    onDismissGroup () {
      if (this.dismissing) return
      // 只有群主才能解散群聊
      if (!this.isLeader) {
        Toast('只有群主可以解散群聊')
        return
      }
      Dialog.confirm({
        title: '解散群聊',
        message: '确定解散该群聊？解散后所有成员将被移出，且无法恢复。',
        confirmButtonColor: '#f56c6c'
      }).then(() => {
        this.dismissGroup()
      }).catch(() => {
        void 0
      })
    },
    dismissGroup () {
      const gid = this.groupId
      if (gid == null) return
      if (this.dismissing) return
      this.dismissing = true
      this.$axios({
        url: '/api/group/delete/group',
        method: 'post',
        data: {
          group_id: Number(gid)
        }
      }).then(res => {
        if (this.apiResponseOk(res.data)) {
          Toast.success('群聊已解散')
          this.applyQuitLocally(gid)
          this.$emit('close')
        } else {
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '解散失败'
          Toast.fail(msg)
        }
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
      }).finally(() => {
        this.dismissing = false
      })
    },
    onSetAdmin () {
      // 仅群主可设置管理员
      if (!this.isLeader) {
        Toast('只有群主可以设置管理员')
        return
      }
      this.adminSelectedIds = []
      this.adminVisible = true
    },
    toggleAdminSelect (personId) {
      const idx = this.adminSelectedIds.findIndex(x => String(x) === String(personId))
      if (idx === -1) {
        // 每个群最多 2 个管理员：已有 + 本次选择不能超过上限
        if (this.currentAdminCount + this.adminSelectedIds.length >= MAX_ADMIN) {
          Toast(`每个群最多设置 ${MAX_ADMIN} 个管理员`)
          return
        }
        this.adminSelectedIds.push(personId)
      } else {
        this.adminSelectedIds.splice(idx, 1)
      }
    },
    isAdminSelected (personId) {
      return this.adminSelectedIds.some(x => String(x) === String(personId))
    },
    closeAdmin () {
      if (this.settingAdmin) return
      this.adminVisible = false
      this.adminSelectedIds = []
    },
    confirmAdmin () {
      const gid = this.groupId
      if (gid == null) return
      if (this.settingAdmin) return
      if (!this.adminSelectedIds.length) {
        Toast('请选择要设置的成员')
        return
      }
      if (this.currentAdminCount + this.adminSelectedIds.length > MAX_ADMIN) {
        Toast(`每个群最多设置 ${MAX_ADMIN} 个管理员`)
        return
      }
      const adminIds = this.adminSelectedIds.map(id => Number(id))
      this.settingAdmin = true
      this.$axios({
        url: '/api/group/change/admin',
        method: 'post',
        data: {
          group_id: Number(gid),
          admin_id: adminIds
        }
      }).then(res => {
        if (this.apiResponseOk(res.data)) {
          Toast.success('设置成功')
          this.fetchGroupInfo()
        } else {
          const msg = (res.data && typeof res.data === 'object' && (res.data.msg || res.data.message))
            ? res.data.msg || res.data.message
            : '设置失败'
          Toast.fail(msg)
        }
        this.adminVisible = false
        this.adminSelectedIds = []
      }).catch(() => {
        Toast.fail('网络异常，请稍后重试')
        this.adminVisible = false
        this.adminSelectedIds = []
      }).finally(() => {
        this.settingAdmin = false
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

.btn-transfer {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #fff;
  font-size: 15px;
  color: #3458DA;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.btn-transfer:hover {
  background: #eef1fc;
}

.btn-dismiss {
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
.btn-dismiss:hover {
  background: #fff5f5;
}

.invite-dialog {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}
.invite-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2430;
  text-align: center;
  border-bottom: 1px solid #f0f1f4;
}
.invite-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  min-height: 120px;
  max-height: 360px;
}
.invite-tip {
  padding: 8px 16px 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}
.invite-empty {
  padding: 28px 0;
  font-size: 13px;
  color: #c0c4cc;
  text-align: center;
}
.invite-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.invite-item:hover {
  background: #f5f7fc;
}
.invite-item.selected {
  background: #eef1fc;
}
.invite-check {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: #3458DA;
  cursor: pointer;
}
.invite-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.invite-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.invite-footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid #f0f1f4;
}
.invite-btn {
  flex: 1;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.invite-btn.cancel {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
}
.invite-btn.confirm {
  border: none;
  background: #3458DA;
  color: #fff;
}
.invite-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
