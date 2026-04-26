import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"
import {
  normalizeIncomingPrivate,
  conversationPeerId,
  normalizeHistoryRow,
  isHistorySuccess,
  extractHistoryList
} from "@/utils/imPayload"

Vue.use(Vuex)

/** userId 尚未写入时暂存私聊 WS，setUserId 后按序回放 */
const MAX_PENDING_PRIVATE_WS = 50
const pendingPrivateRawQueue = []

function applyChatIncomingPrivate (state, raw, userId) {
  const me = userId != null && userId !== '' ? Number(userId) : NaN
  if (!Number.isFinite(me)) return
  const norm = normalizeIncomingPrivate(raw)
  if (!norm) return
  const peerId = conversationPeerId(me, norm)
  if (!Number.isFinite(peerId)) {
    console.warn('[chatIncomingPrivate] 无法解析会话对方 id，请检查 WS 字段名', raw)
    return
  }
  const friendKey = String(peerId)
  const outgoing = Number.isFinite(me) &&
    Number.isFinite(norm.sender_id) &&
    norm.sender_id === me
  const ts = Number.isFinite(norm.timestamp) ? norm.timestamp : Date.now()
  const id = `in-${ts}-${Math.random().toString(36).slice(2, 9)}`
  const row = {
    id,
    outgoing,
    pending: false,
    failed: false,
    msg_type: norm.msg_type || 1,
    msg: norm.msg || '',
    file_url: norm.file_url || '',
    file_name: norm.file_name || '',
    timestamp: ts
  }
  const prev = state.messagesByFriend[friendKey] || []
  Vue.set(state.messagesByFriend, friendKey, prev.concat(row))
}

// 默认头像信息
const default_avatar = {
  id: 1,
  url: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
}

const store = new Vuex.Store({
  state: {
    // 页面
    addFriendPage: false, // 添加好友页面
    createGroupPage: false, // 创建群聊页面
    chatSubStatus: '', // 当前聊天子页面状态（'chat'、'note'等）
    chatNotePage: false, // 聊天记录页面
    avatarPage: false, // 头像选择页面

    // 用户信息
    userEmail: '',
    userName: '',
    userGender: 0,
    userPicture: default_avatar.url, // 用户头像URL
    userPictureId: default_avatar.id, // 用户头像ID
    userSignature: '', // 用户个性签名

    userFriendList: [], // 用户好友列表，用来保存用户通讯录的好友
    currentFriendDetail: null, // 当前选中的好友详情
    chatFriendList: [], // 聊天会话好友列表
    currentChatFriendId: null, // 当前聊天会话好友id

    userId: null, // 当前登录用户 id（用于区分收发、对齐历史记录）
    messagesByFriend: {}, // { [friendId]: ChatBubble[] }
    socketConnected: false,

    // 选择的头像信息
    selectedAvatarId: null,
    selectedAvatarUrl: ''
  },
  mutations: {
    openAddFriendPage (state) {
      state.addFriendPage = true
    },
    closeAddFriendPage (state) {
      state.addFriendPage = false
    },
    openCreateGroupPage (state) {
      state.createGroupPage = true
    },
    closeCreateGroupPage (state) {
      state.createGroupPage = false
    },
    setChatSubStatus (state, status) {
      state.chatSubStatus = status
    },
    openChatNotePage (state) {
      state.chatNotePage = true
    },
    closeChatNotePage (state) {
      state.chatNotePage = false
    },
    openAvatarPage (state) {
      state.avatarPage = true
    },
    closeAvatarPage (state) {
      state.avatarPage = false
    },
    setSelectedAvatar (state, { id, url }) {
      state.selectedAvatarId = id
      state.selectedAvatarUrl = url
    },
    setUserInfo (state, { name, gender, picture, pictureId, signature, email }) {
      if (name !== undefined) state.userName = name
      if (gender !== undefined) state.userGender = gender
      if (picture !== undefined) state.userPicture = picture
      if (pictureId !== undefined) state.userPictureId = pictureId
      if (signature !== undefined) state.userSignature = signature
      if (email !== undefined) state.userEmail = email
    },
    setUserFriendList (state, friendList) {
      state.userFriendList = friendList
    },
    setCurrentFriendDetail (state, friendDetail) {
      state.currentFriendDetail = friendDetail
    },
    openFriendChat (state, friendDetail) {
      if (!friendDetail) return
      const friendId = friendDetail.id
      if (friendId === undefined || friendId === null || friendId === '') return

      const idx = state.chatFriendList.findIndex(item => String(item.id) === String(friendId))
      if (idx > -1) {
        state.chatFriendList.splice(idx, 1)
      }
      state.chatFriendList.unshift(friendDetail)
      state.currentChatFriendId = friendId
    },
    setCurrentChatFriendId (state, friendId) {
      state.currentChatFriendId = friendId
    },
    setChatFriendList (state, list) {
      state.chatFriendList = Array.isArray(list) ? list : []
    },
    setUserId (state, id) {
      if (id === null || id === undefined || id === '') {
        state.userId = null
        pendingPrivateRawQueue.length = 0
        return
      }
      const n = Number(id)
      state.userId = Number.isFinite(n) ? n : null
      if (!Number.isFinite(state.userId)) {
        pendingPrivateRawQueue.length = 0
        return
      }
      const uid = state.userId
      if (pendingPrivateRawQueue.length) {
        const batch = pendingPrivateRawQueue.splice(0, pendingPrivateRawQueue.length)
        for (const raw of batch) {
          applyChatIncomingPrivate(state, raw, uid)
        }
      }
    },
    setSocketConnected (state, v) {
      state.socketConnected = !!v
    },
    clearChatSession (state) {
      pendingPrivateRawQueue.length = 0
      state.userId = null
      state.messagesByFriend = {}
      state.socketConnected = false
    },
    appendPendingOutMessage (state, { friendId, msg, tempId, msg_type = 1, file_url = '', file_name = '' }) {
      const key = String(friendId)
      const prev = state.messagesByFriend[key] || []
      const row = {
        id: tempId,
        outgoing: true,
        pending: true,
        failed: false,
        msg_type,
        msg: msg != null ? String(msg) : '',
        file_url: file_url != null ? String(file_url) : '',
        file_name: file_name != null ? String(file_name) : '',
        timestamp: null
      }
      Vue.set(state.messagesByFriend, key, prev.concat(row))
    },
    chatMessageAck (state, { receiver_id, timestamp, msg_type }) {
      if (receiver_id === null || receiver_id === undefined || receiver_id === '') return
      const key = String(receiver_id)
      const list = state.messagesByFriend[key]
      if (!list || !list.length) return
      const matchType = msg_type != null ? Number(msg_type) : null
      const idx = list.findIndex(m => {
        if (!m.outgoing || !m.pending || m.failed) return false
        if (matchType == null || Number.isNaN(matchType)) return true
        return Number(m.msg_type) === matchType
      })
      if (idx === -1) return
      const cur = list[idx]
      const next = {
        ...cur,
        pending: false,
        timestamp: timestamp != null ? Number(timestamp) : cur.timestamp
      }
      const nextList = list.slice()
      nextList[idx] = next
      Vue.set(state.messagesByFriend, key, nextList)
    },
    chatMessageSendFailed (state, { friendId, tempId }) {
      const key = String(friendId)
      const list = state.messagesByFriend[key]
      if (!list) return
      const idx = list.findIndex(m => m.id === tempId)
      if (idx === -1) return
      const cur = list[idx]
      const nextList = list.slice()
      nextList[idx] = { ...cur, pending: false, failed: true }
      Vue.set(state.messagesByFriend, key, nextList)
    },
    chatIncomingPrivate (state, { raw, userId }) {
      const me = userId != null && userId !== '' ? Number(userId) : NaN
      if (!Number.isFinite(me)) {
        if (pendingPrivateRawQueue.length < MAX_PENDING_PRIVATE_WS) {
          pendingPrivateRawQueue.push(raw)
        }
        return
      }
      applyChatIncomingPrivate(state, raw, userId)
    },
    /**
     * 合并服务端历史与本地未同步气泡，避免拉历史覆盖掉已收到的 WS 消息
     */
    setFriendMessagesFromHistory (state, { friendId, messages }) {
      const key = String(friendId)
      const serverSorted = (messages || []).slice().sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      const existing = state.messagesByFriend[key] || []
      const rowKey = m => `${m.timestamp}|${m.outgoing ? 1 : 0}|${(m.msg || '').slice(0, 120)}`
      const serverKeys = new Set(serverSorted.map(rowKey))
      const extras = existing.filter(m => {
        if (m.pending) return true
        if (m.failed) return true
        const id = m.id != null ? String(m.id) : ''
        if (id.startsWith('in-') || id.startsWith('p-')) {
          return !serverKeys.has(rowKey(m))
        }
        return false
      })
      const merged = serverSorted.concat(extras).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      Vue.set(state.messagesByFriend, key, merged)
    }
  },
  actions: {
    async fetchChatHistory ({ commit, state }, { friendId }) {
      const fid = friendId != null ? Number(friendId) : NaN
      if (!Number.isFinite(fid)) return
      try {
        const res = await axios.get('/api/chat/history', {
          params: { receiver_id: fid, page: 1, size: 50 }
        })
        const data = res.data
        if (!isHistorySuccess(data)) {
          console.warn('[fetchChatHistory] 接口未返回 success，已跳过写入', data)
          return
        }
        const rawList = extractHistoryList(data)
        const me = state.userId != null ? Number(state.userId) : NaN
        const normalized = rawList
          .map((row, i) => normalizeHistoryRow(row, me, i, fid))
          .filter(Boolean)
        commit('setFriendMessagesFromHistory', { friendId: fid, messages: normalized })
      } catch (e) {
        console.warn('[fetchChatHistory]', e)
      }
    },
    markChatRead (ctx, { friendId }) {
      const fid = friendId != null ? Number(friendId) : NaN
      if (!Number.isFinite(fid)) return Promise.resolve()
      return axios.post('/api/chat/read', { receiver_id: fid }).catch(() => {})
    }
  }
})

export default store