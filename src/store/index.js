import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"
import {
  normalizeIncomingPrivate,
  conversationPeerId,
  normalizeHistoryRow,
  isHistorySuccess,
  extractHistoryList,
  bubbleDedupeKey,
  toMsgIdStr,
  firstMsgIdStr,
  toTimestampMs
} from "@/utils/imPayload"
import { extractFriendMainRow } from "@/utils/contactFriendMain"
import { hydrateUserIdFromToken } from "@/utils/jwtUserId"

Vue.use(Vuex)

/** userId 尚未写入时暂存私聊 WS，setUserId 后按序回放 */
const MAX_PENDING_PRIVATE_WS = 50
const pendingPrivateRawQueue = []

function normalizeMsgIdForStore (v) {
  const s = toMsgIdStr(v)
  return s || null
}

function messageTimestamp (m) {
  const t = Number(m && m.timestamp)
  return Number.isFinite(t) && t > 0 ? t : null
}

function hasValidMessageTimestamp (m) {
  return messageTimestamp(m) != null
}

function compareMessagesByTime (a, b) {
  const at = messageTimestamp(a)
  const bt = messageTimestamp(b)
  if (at != null && bt != null) return at - bt
  if (at != null) return -1
  if (bt != null) return 1
  return 0
}

function mergeHistoryWithExistingBubble (server, existing) {
  if (!existing) return server
  return {
    ...existing,
    ...server,
    id: server.id || existing.id,
    msg_id: server.msg_id || existing.msg_id || null,
    msg: server.msg || existing.msg || '',
    file_url: server.file_url || existing.file_url || '',
    file_name: server.file_name || existing.file_name || '',
    timestamp: hasValidMessageTimestamp(server) ? server.timestamp : existing.timestamp,
    pending: false,
    failed: false
  }
}

// 默认头像信息
const default_avatar = {
  id: 1,
  url: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
}

/** 与 views/ChatRoom/friend.vue 中好友详情字段对齐；partial 为 true 时不补默认性别/签名，避免详情拉取前闪烁 */
function normalizeFriendDetailRow (item, opts) {
  const partial = opts && opts.partial === true
  if (!item || typeof item !== 'object') {
    return {
      id: '',
      username: '',
      nickname: '',
      remark: '',
      friend_remark: '',
      gender: '',
      signature: partial ? '' : '这个人很懒，什么都没有留下',
      avatar: ''
    }
  }
  const rawGender = item.gender ?? item.friend_gender
  let gender = item.genderText ?? item.friend_genderText ?? ''
  if (!gender) {
    if (rawGender === '男' || rawGender === '女') {
      gender = rawGender
    } else if (rawGender === '' || rawGender === undefined || rawGender === null) {
      gender = partial ? '' : '男'
    } else {
      gender = Number(rawGender) === 1 ? '女' : '男'
    }
  }
  const sigRaw = item.signature ?? item.friend_signature
  let signature
  if (sigRaw !== undefined && sigRaw !== null && sigRaw !== '') {
    signature = sigRaw
  } else {
    signature = partial ? '' : '这个人很懒，什么都没有留下'
  }
  const province = item.province ?? item.friend_province ?? ''
  const city = item.city ?? item.friend_city ?? ''
  const region = item.region ?? item.area ?? ''
  const remark = item.remark ?? item.friend_remark ?? ''
  const friend_remark = item.friend_remark ?? item.remark ?? ''
  return {
    id: item.id ?? item.friend_id ?? '',
    type: item.type,
    username: item.username ?? item.name ?? item.friend_name ?? '',
    nickname: item.nickname ?? item.remark ?? item.friend_remark ?? item.friend_name ?? item.name ?? '',
    remark: remark != null ? String(remark) : '',
    friend_remark: friend_remark != null ? String(friend_remark) : '',
    gender,
    signature,
    avatar: item.avatar ?? item.picture ?? item.friend_picture ?? item['friend-picture'] ?? '',
    province,
    city,
    region
  }
}

function touchChatFriendToTop (state, friendId, fallback) {
  const fid = friendId != null ? String(friendId) : ''
  if (!fid) return
  const list = state.chatFriendList || []
  const idx = list.findIndex(item => String(item.id) === fid)

  let detail = idx > -1 ? list[idx] : null
  if (!detail) {
    const fromContact = (state.userFriendList || []).find(
      item => String(item.friend_id ?? item.id) === fid
    )
    if (fromContact) {
      detail = normalizeFriendDetailRow(fromContact)
    }
  }
  if (!detail) {
    const fromGroup = (state.userGroupList || []).find(
      item => String(item.group_id ?? item.id) === fid
    )
    if (fromGroup) {
      detail = {
        id: fromGroup.group_id ?? fromGroup.id,
        type: 'group',
        username: fromGroup.group_name ?? fromGroup.name ?? '',
        avatar: fromGroup.group_picture ?? fromGroup.picture ?? fromGroup.avatar ?? '',
        nickname: fromGroup.group_name ?? fromGroup.name ?? ''
      }
    }
  }
  if (!detail && fallback) {
    detail = normalizeFriendDetailRow({ ...fallback, id: fallback.id ?? friendId, friend_id: friendId })
  }
  if (!detail) return

  const next = { ...detail, id: detail.id ?? friendId }
  if (idx > -1) {
    state.chatFriendList.splice(idx, 1)
  }
  state.chatFriendList.unshift(next)
}

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
  const prev = state.messagesByFriend[friendKey] || []
  // 文件消息：部分实现会向发送方再推一条 private（带真实 msg_id），与本地已展示的发送气泡重复。
  // 不再直接丢弃，而是把 echo 的 msg_id 回填到已有气泡上。
  if (outgoing && (Number(norm.msg_type) === 2 || Number(norm.msg_type) === 3)) {
    const url = String(norm.file_url || norm.msg || '').trim()
    if (url) {
      const dupIdx = prev.findIndex(m =>
        m.outgoing &&
        Number(m.msg_type) === 2 &&
        !m.failed &&
        (String(m.file_url || '').trim() === url || String(m.msg || '').trim() === url)
      )
      if (dupIdx !== -1) {
        const cur = prev[dupIdx]
        // echo 是服务端确认：回填 msg_id，并兜底清掉 pending（文件若无单独 ack 不会卡在“发送中”）
        if ((norm.msg_id != null && cur.msg_id == null) || cur.pending) {
          const nextList = prev.slice()
          nextList[dupIdx] = {
            ...cur,
            msg_id: cur.msg_id == null && norm.msg_id != null ? normalizeMsgIdForStore(norm.msg_id) : cur.msg_id,
            pending: false
          }
          Vue.set(state.messagesByFriend, friendKey, nextList)
        }
        return
      }
    }
  }
  // 文本消息：若服务端把自己发的文本 echo 回来（带 msg_id），同样命中已有发送气泡并回填，
  // 不新建重复气泡。只在已有气泡缺 msg_id 时回填，避免把两条相同文本误并成一条。
  if (outgoing && Number(norm.msg_type) === 1) {
    const text = String(norm.msg || '').trim()
    if (text && norm.msg_id != null) {
      const dupIdx = prev.findIndex(m =>
        m.outgoing &&
        Number(m.msg_type) === 1 &&
        !m.failed &&
        m.msg_id == null &&
        String(m.msg || '').trim() === text
      )
      if (dupIdx !== -1) {
        const cur = prev[dupIdx]
        const nextList = prev.slice()
        nextList[dupIdx] = { ...cur, msg_id: normalizeMsgIdForStore(norm.msg_id), pending: false }
        Vue.set(state.messagesByFriend, friendKey, nextList)
        return
      }
    }
  }
  const ts = Number.isFinite(norm.timestamp) ? norm.timestamp : null
  const idTs = ts != null ? ts : Date.now()
  const id = `in-${idTs}-${Math.random().toString(36).slice(2, 9)}`
  const row = {
    id,
    msg_id: normalizeMsgIdForStore(norm.msg_id),
    outgoing,
    pending: false,
    failed: false,
    msg_type: norm.msg_type || 1,
    msg: norm.msg || '',
    file_url: norm.file_url || '',
    file_name: norm.file_name || '',
    timestamp: ts
  }
  // 去重：socket 重连补推可能与历史消息重复，避免同一气泡被 append 两次
  const dedupeKey = bubbleDedupeKey(row)
  if (dedupeKey && prev.some(m => bubbleDedupeKey(m) === dedupeKey)) return

  // 追加后按时间排序，防止补推消息时间乱序导致"文件在上、文本在最后"
  Vue.set(state.messagesByFriend, friendKey, [...prev, row].sort(compareMessagesByTime))
  touchChatFriendToTop(state, peerId)
}

function normalizeGroupMessageRow (raw, prev, me) {
  const groupId = raw.group_id ?? raw.groupId
  if (!groupId && groupId !== 0) {
    return null
  }
  const gid = String(groupId)
  const senderId = raw.sender_id ?? raw.senderId
  const outgoing = Number.isFinite(me) &&
    Number.isFinite(senderId) &&
    senderId === me

  const existing = prev || []
  // 自己发的群消息：服务端会把同一条 echo 回来（带真实 msg_id）。本地已有发送气泡时
  // 不再追加新气泡，而是返回该气泡引用，由调用方把 echo 的 msg_id 回填上去。
  const echoMsgId = firstMsgIdStr(raw, ['msg_id', 'msgId', 'MsgId', 'MsgID', 'id', 'Id', 'ID', 'message_id', 'messageId'])
  if (outgoing && Number(raw.msg_type) === 1) {
    const text = String(raw.msg || '').trim()
    if (text) {
      // 优先匹配「还没拿到 msg_id」的发送气泡，避免连发两条相同文本时误并成一条
      const dup = existing.find(m =>
        m.outgoing &&
        Number(m.msg_type) === 1 &&
        !m.failed &&
        m.msg_id == null &&
        String(m.msg || '').trim() === text
      ) || existing.find(m =>
        m.outgoing &&
        Number(m.msg_type) === 1 &&
        !m.failed &&
        String(m.msg || '').trim() === text
      )
      if (dup) return { dupRow: dup, msgId: echoMsgId != null ? echoMsgId : null }
    }
  }
  if (outgoing && (Number(raw.msg_type) === 2 || Number(raw.msg_type) === 3)) {
    const url = String(raw.url || raw.msg || '').trim()
    if (url) {
      const dup = existing.find(m =>
        m.outgoing &&
        Number(m.msg_type) === 2 &&
        !m.failed &&
        m.msg_id == null &&
        (String(m.file_url || '').trim() === url || String(m.msg || '').trim() === url)
      ) || existing.find(m =>
        m.outgoing &&
        Number(m.msg_type) === 2 &&
        !m.failed &&
        (String(m.file_url || '').trim() === url || String(m.msg || '').trim() === url)
      )
      if (dup) return { dupRow: dup, msgId: echoMsgId != null ? echoMsgId : null }
    }
  }

  const tsRaw =
    raw.time_string ??
    raw.timeString ??
    raw.timestamp ??
    raw.Timestamp ??
    raw.create_time ??
    raw.createTime ??
    raw.msg_time ??
    raw.msgTime ??
    raw.time ??
    raw._client_received_at
  const parsed = toTimestampMs(tsRaw)
  const ts = Number.isFinite(parsed) ? parsed : null
  const idTs = ts != null ? ts : Date.now()
  const id = echoMsgId || `gin-${idTs}-${Math.random().toString(36).slice(2, 9)}`
  return {
    gid,
    groupId,
    row: {
      id,
      msg_id: normalizeMsgIdForStore(echoMsgId),
      outgoing,
      pending: false,
      failed: false,
      msg_type: raw.msg_type || 1,
      msg: raw.msg || '',
      file_url: raw.url || raw.file_url || '',
      file_name: raw.file_name || '',
      timestamp: ts,
      sender_name: raw.sender_name || '',
      sender_picture: raw.sender_picture || ''
    }
  }
}

let persistMessagesTimer = null
const MESSAGE_MUTATIONS = new Set([
  'setFriendMessagesFromHistory',
  'appendPendingOutMessage',
  'updatePendingOutFileUrl',
  'chatMessageAck',
  'chatMessageSendFailed',
  'groupMessageAck',
  'batchGroupIncomingMessages',
  'chatIncomingPrivate',
  'clearMessagesForFriend',
  'clearChatSession'
])

function persistChatSession (store) {
  store.subscribe((mutation, state) => {
    if (mutation.type === 'setCurrentChatFriendId' || mutation.type === 'setChatSubStatus' || mutation.type === 'setCurrentFriendDetail') {
      try {
        sessionStorage.setItem('chat_session', JSON.stringify({
          currentChatFriendId: state.currentChatFriendId,
          chatSubStatus: state.chatSubStatus,
          currentFriendDetail: state.currentFriendDetail,
          chatType: (state.currentFriendDetail && state.currentFriendDetail.type)
            || (state.currentChatFriendId
              && state.chatFriendList.find(item => String(item.id) === String(state.currentChatFriendId))
              && state.chatFriendList.find(item => String(item.id) === String(state.currentChatFriendId)).type)
            || (() => {
              try {
                const prev = JSON.parse(sessionStorage.getItem('chat_session'))
                return (prev && prev.chatType) || null
              } catch (_) { return null }
            })()
            || null
        }))
      } catch (_) { /* ignore */ }
    }
    if (mutation.type === 'setUserGroupList') {
      try {
        sessionStorage.setItem('user_group_list', JSON.stringify(state.userGroupList))
      } catch (_) { /* ignore */ }
    }
    if (MESSAGE_MUTATIONS.has(mutation.type)) {
      if (persistMessagesTimer) clearTimeout(persistMessagesTimer)
      persistMessagesTimer = setTimeout(() => {
        try {
          sessionStorage.setItem('chat_messages', JSON.stringify(state.messagesByFriend))
        } catch (_) { /* ignore */ }
        persistMessagesTimer = null
        store.commit('sortChatFriendList')
      }, 300)
    }
  })
}

const store = new Vuex.Store({
  plugins: [persistChatSession],
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
    userGroupList: [], // 用户群聊列表
    currentFriendDetail: null, // 当前选中的好友详情
    friendDetailLoading: false, // 好友主页接口拉取中（用于详情区加载态）
    currentGroupDetail: null, // 当前选中的群聊详情
    groupDetailLoading: false, // 群聊详情接口拉取中
    chatFriendList: [], // 聊天会话好友列表
    currentChatFriendId: null, // 当前聊天会话好友id

    userId: null, // 当前登录用户 id（用于区分收发、对齐历史记录）
    messagesByFriend: {}, // { [friendId]: ChatBubble[] }
    groupMembersByGroup: {}, // { [groupId]: GroupMember[] } 群成员列表缓存，进入会话时预拉，避免设置面板按钮闪烁
    socketConnected: false,
    pendingHistoryLoads: {}, // { [key]: true } 正在拉取历史的聊天，防止重复 dispatch

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
    setUserGroupList (state, list) {
      state.userGroupList = Array.isArray(list) ? list : []
    },
    setGroupMembers (state, { groupId, members }) {
      Vue.set(state.groupMembersByGroup, String(groupId), Array.isArray(members) ? members : [])
    },
    addGroupMembers (state, { groupId, members }) {
      const key = String(groupId)
      const cur = state.groupMembersByGroup[key] || []
      const exist = new Set(cur.map(m => String(m.person_id)))
      const additions = (members || []).filter(m => !exist.has(String(m.person_id)))
      Vue.set(state.groupMembersByGroup, key, cur.concat(additions))
    },
    removeGroupMembers (state, { groupId, personIds }) {
      const key = String(groupId)
      const cur = state.groupMembersByGroup[key] || []
      const removeSet = new Set((personIds || []).map(id => String(id)))
      Vue.set(state.groupMembersByGroup, key, cur.filter(m => !removeSet.has(String(m.person_id))))
    },
    setCurrentFriendDetail (state, friendDetail) {
      state.currentFriendDetail = friendDetail
    },
    setFriendDetailLoading (state, loading) {
      state.friendDetailLoading = !!loading
    },
    setCurrentGroupDetail (state, detail) {
      state.currentGroupDetail = detail
    },
    setGroupDetailLoading (state, loading) {
      state.groupDetailLoading = !!loading
    },
    openFriendChat (state, friendDetail) {
      if (!friendDetail) return
      const friendId = friendDetail.id
      if (friendId === undefined || friendId === null || friendId === '') return
      const idx = state.chatFriendList.findIndex(item => String(item.id) === String(friendId))
      if (idx === -1) {
        touchChatFriendToTop(state, friendId, friendDetail)
      }
      state.currentChatFriendId = friendId
    },
    setCurrentChatFriendId (state, friendId) {
      state.currentChatFriendId = friendId
    },
    setChatFriendList (state, list) {
      state.chatFriendList = Array.isArray(list) ? list : []
    },
    /**
     * 本地同步好友备注（保存成功后调用），更新会话列表、通讯录、当前详情
     * 约定：username 为对方原名；nickname 为展示名 = 有备注用备注否则原名
     */
    applyFriendRemark (state, { friendId, remark }) {
      const fid = friendId != null ? String(friendId) : ''
      if (!fid) return
      const r = remark != null ? String(remark).trim() : ''

      const cidx = state.chatFriendList.findIndex(item => String(item.id) === fid)
      if (cidx > -1) {
        const cur = state.chatFriendList[cidx]
        const baseName = cur.username || ''
        const next = {
          ...cur,
          remark: r,
          friend_remark: r,
          nickname: r || baseName
        }
        Vue.set(state.chatFriendList, cidx, next)
      }

      const uidx = state.userFriendList.findIndex(
        item => String(item.friend_id ?? item.id) === fid
      )
      if (uidx > -1) {
        const u = { ...state.userFriendList[uidx] }
        u.friend_remark = r
        u.remark = r
        Vue.set(state.userFriendList, uidx, u)
      }

      const d = state.currentFriendDetail
      if (d && String(d.id) === fid) {
        const base = d.username || ''
        state.currentFriendDetail = {
          ...d,
          remark: r,
          friend_remark: r,
          nickname: r || base
        }
      }
    },
    applyGroupRemark (state, { groupId, remark }) {
      const gid = groupId != null ? String(groupId) : ''
      if (!gid) return
      const r = remark != null ? String(remark).trim() : ''

      const cidx = state.chatFriendList.findIndex(item => String(item.id) === gid)
      if (cidx > -1) {
        const cur = state.chatFriendList[cidx]
        const baseName = cur.username || ''
        Vue.set(state.chatFriendList, cidx, {
          ...cur,
          remark: r,
          nickname: r || baseName
        })
      }

      const d = state.currentFriendDetail
      if (d && String(d.id) === gid) {
        const base = d.username || ''
        state.currentFriendDetail = {
          ...d,
          remark: r,
          nickname: r || base
        }
      }

      const g = state.currentGroupDetail
      if (g && String(g.group_id) === gid) {
        state.currentGroupDetail = {
          ...g,
          remark: r
        }
      }
    },
    applyGroupNickname (state, { groupId, nickname }) {
      const gid = groupId != null ? String(groupId) : ''
      if (!gid) return
      const n = nickname != null ? String(nickname).trim() : ''

      const d = state.currentFriendDetail
      if (d && String(d.id) === gid) {
        state.currentFriendDetail = {
          ...d,
          my_nickname: n
        }
      }

      const g = state.currentGroupDetail
      if (g && String(g.group_id) === gid) {
        state.currentGroupDetail = {
          ...g,
          my_nickname: n
        }
      }
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
    restoreMessagesFromSession (state) {
      try {
        const saved = sessionStorage.getItem('chat_messages')
        if (!saved) return
        const parsed = JSON.parse(saved)
        if (!parsed || typeof parsed !== 'object') return
        for (const key of Object.keys(state.messagesByFriend)) {
          Vue.delete(state.messagesByFriend, key)
        }
        for (const [key, msgs] of Object.entries(parsed)) {
          Vue.set(state.messagesByFriend, key, msgs)
        }
      } catch (_) { /* ignore */ }
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
        // 聊天气泡时间按客户端发送时刻显示，不等待后端 ack 时间
        timestamp: Date.now()
      }
      Vue.set(state.messagesByFriend, key, prev.concat(row))
      touchChatFriendToTop(state, friendId)
    },
    /** 上传完成后把本地预览 URL 换成服务端地址，再发 socket */
    updatePendingOutFileUrl (state, { friendId, tempId, msg, file_url, file_name, msg_id, markSent = false }) {
      const key = String(friendId)
      const list = state.messagesByFriend[key]
      if (!list || !list.length) return
      const idx = list.findIndex(m => m.id === tempId && m.pending && !m.failed)
      if (idx === -1) return
      const cur = list[idx]
      const next = {
        ...cur,
        // markSent 用于群文件：HTTP 上传成功后后端会自动推送 group_message，
        // 前端不再 emit、收不到 ack，故在此直接把气泡标记为已发送。
        pending: markSent ? false : cur.pending,
        msg: msg != null ? String(msg) : cur.msg,
        file_url: file_url != null ? String(file_url) : cur.file_url,
        file_name: file_name != null ? String(file_name) : cur.file_name,
        msg_id: msg_id != null ? normalizeMsgIdForStore(msg_id) : cur.msg_id
      }
      const nextList = list.slice()
      nextList[idx] = next
      Vue.set(state.messagesByFriend, key, nextList)
    },
    chatMessageAck (state, { receiver_id, timestamp, msg_type, msg_id }) {
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
        // ack 若带回真实 msg_id，则回填
        msg_id: msg_id != null ? normalizeMsgIdForStore(msg_id) : cur.msg_id,
        // 若发送时已记录本地时间，ack 不覆盖；仅在缺失时补写
        timestamp: cur.timestamp != null ? cur.timestamp : (timestamp != null ? Number(timestamp) : cur.timestamp)
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
    groupMessageAck (state, { group_id, msg_type }) {
      if (group_id === null || group_id === undefined || group_id === '') return
      const key = String(group_id)
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
        pending: false
      }
      const nextList = list.slice()
      nextList[idx] = next
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
    batchGroupIncomingMessages (state, { buffer, userId }) {
      const me = userId != null && userId !== '' ? Number(userId) : NaN
      if (!Number.isFinite(me) || !buffer || typeof buffer !== 'object') return
      const gids = []
      for (const [gid, raws] of Object.entries(buffer)) {
        if (!Array.isArray(raws) || !raws.length) continue
        const prev = state.messagesByFriend[gid] || []
        const collector = [...prev]
        let touched = false
        for (const raw of raws) {
          const result = normalizeGroupMessageRow(raw, collector, me)
          if (!result) continue
          // echo 命中已有发送气泡：把真实 msg_id 回填上去，不追加新气泡
          if (result.dupRow) {
            if (result.msgId != null && result.dupRow.msg_id == null) {
              const idx = collector.indexOf(result.dupRow)
              if (idx !== -1) {
                collector[idx] = { ...result.dupRow, msg_id: normalizeMsgIdForStore(result.msgId) }
                touched = true
              }
            }
            continue
          }
          collector.push(result.row)
          touched = true
        }
        if (touched) {
          Vue.set(state.messagesByFriend, gid, collector)
          gids.push(gid)
        }
      }
      for (const gid of gids) {
        touchChatFriendToTop(state, gid)
      }
    },
    finishGroupReplay (state, { groupId }) {
      touchChatFriendToTop(state, groupId)
    },
    /** 清空与某好友的本地消息列表（仅前端；未调用服务端删历史） */
    clearMessagesForFriend (state, friendId) {
      const key = friendId != null ? String(friendId) : ''
      if (!key) return
      Vue.set(state.messagesByFriend, key, [])
    },
    setFriendMessagesFromHistory (state, { friendId, messages }) {
      const key = String(friendId)
      const existing = state.messagesByFriend[key] || []
      const existingByKey = new Map()
      for (const row of existing) {
        const k = bubbleDedupeKey(row)
        if (k && !existingByKey.has(k)) existingByKey.set(k, row)
      }
      const serverSorted = (messages || [])
        .slice()
        .sort(compareMessagesByTime)
        .map(row => mergeHistoryWithExistingBubble(row, existingByKey.get(bubbleDedupeKey(row))))
      const serverKeys = new Set(serverSorted.map(bubbleDedupeKey).filter(Boolean))
      const extras = existing.filter(m => {
        if (m.pending) return true
        if (m.failed) return true
        const id = m.id != null ? String(m.id) : ''
        if (id.startsWith('in-') || id.startsWith('p-') || id.startsWith('hist-') || id.startsWith('gin-') || /^\d+$/.test(id)) {
          const k = bubbleDedupeKey(m)
          return !k || !serverKeys.has(k)
        }
        return false
      })
      const merged = serverSorted.concat(extras).sort(compareMessagesByTime)
      Vue.set(state.messagesByFriend, key, merged)
    },
    sortChatFriendList (state) {
      const list = state.chatFriendList || []
      if (list.length <= 1) return
      const sorted = [...list].sort((a, b) => {
        const aId = String(a.id)
        const bId = String(b.id)
        const aMsgs = state.messagesByFriend[aId] || []
        const bMsgs = state.messagesByFriend[bId] || []
        const aLatest = aMsgs.length ? Number(aMsgs[aMsgs.length - 1].timestamp || 0) : 0
        const bLatest = bMsgs.length ? Number(bMsgs[bMsgs.length - 1].timestamp || 0) : 0
        const aFallback = aLatest || (Number(a.last_msg_time) || 0)
        const bFallback = bLatest || (Number(b.last_msg_time) || 0)
        return bFallback - aFallback
      })
      state.chatFriendList.splice(0, state.chatFriendList.length, ...sorted)
    }
  },
  actions: {
    async fetchChatHistory ({ commit, state }, { friendId }) {
      const fid = friendId != null ? Number(friendId) : NaN
      if (!Number.isFinite(fid)) return
      const key = String(fid)
      if (state.pendingHistoryLoads[key]) return
      Vue.set(state.pendingHistoryLoads, key, true)
      try {
        hydrateUserIdFromToken()
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
      } finally {
        Vue.delete(state.pendingHistoryLoads, key)
      }
    },
    /** 从通讯录或会话列表拼装占位信息并拉取好友主页，供聊天气泡头像跳转详情使用 */
    async fetchFriendDetailPanel ({ commit, state }, { friendId }) {
      const fid = friendId != null ? Number(friendId) : NaN
      if (!Number.isFinite(fid)) return

      const fromContact = state.userFriendList.find(
        x => String(x.friend_id ?? x.id) === String(fid)
      )
      const fromChat = state.chatFriendList.find(x => String(x.id) === String(fid))
      const raw = fromContact || {
        friend_id: fid,
        friend_name: (fromChat && (fromChat.username || fromChat.nickname)) || '',
        friend_picture: (fromChat && fromChat.avatar) || ''
      }
      const fallback = normalizeFriendDetailRow(raw, { partial: true })
      commit('setFriendDetailLoading', true)
      commit('setCurrentFriendDetail', fallback)

      try {
        const res = await axios.post('/api/contact/friend/main', { friend_id: fid })
        const row = extractFriendMainRow(res.data)
        commit('setCurrentFriendDetail', normalizeFriendDetailRow({ ...fallback, ...row, friend_id: fid }))
      } catch (e) {
        // 保留 fallback，静默失败
      } finally {
        commit('setFriendDetailLoading', false)
      }
    },
    async fetchGroupList ({ commit }) {
      try {
        const res = await axios.get('/api/group/create/list')
        const ok = res.data && (res.data.error === 'success' || res.data.err === 'success')
        if (!ok) return
        const raw = res.data.list || res.data.groups || []
        const list = (Array.isArray(raw) ? raw : []).map(row => ({
          group_id: row.group_id ?? row.id,
          group_name: row.group_name ?? row.name ?? '',
          group_picture: row.group_picture ?? row.picture ?? row.avatar ?? ''
        }))
        commit('setUserGroupList', list)
      } catch (e) {
        console.warn('[fetchGroupList]', e)
      }
    },
    async fetchGroupChatHistory ({ commit, state }, { groupId }) {
      const gid = groupId != null ? Number(groupId) : NaN
      if (!Number.isFinite(gid)) return
      const key = String(gid)
      if (state.pendingHistoryLoads[key]) return
      Vue.set(state.pendingHistoryLoads, key, true)
      try {
        hydrateUserIdFromToken()
        const res = await axios.get('/api/group/history', {
          params: { group_id: gid, page: 1, size: 50 }
        })
        const data = res.data
        if (!isHistorySuccess(data)) {
          console.warn('[fetchGroupChatHistory] 接口未返回 success，已跳过写入', data)
          return
        }
        const rawList = extractHistoryList(data)
        const me = state.userId != null ? Number(state.userId) : NaN
        const normalized = rawList
          .map((row, i) => normalizeHistoryRow(row, me, i, gid))
          .filter(Boolean)
        commit('setFriendMessagesFromHistory', { friendId: gid, messages: normalized })
      } catch (e) {
        console.warn('[fetchGroupChatHistory]', e)
      } finally {
        Vue.delete(state.pendingHistoryLoads, key)
      }
    },
    async fetchGroupMembers ({ commit }, { groupId }) {
      const gid = groupId != null ? Number(groupId) : NaN
      if (!Number.isFinite(gid)) return
      try {
        const res = await axios.post('/api/group/show/all', { group_id: gid })
        const data = res.data
        const ok = data && (data.error === 'success' || data.err === 'success' || data.message === 'success')
        if (!ok) return
        const members = Array.isArray(data.group_person) ? data.group_person : []
        commit('setGroupMembers', { groupId: gid, members })
      } catch (e) {
        console.warn('[fetchGroupMembers]', e)
      }
    }
  }
})

export default store