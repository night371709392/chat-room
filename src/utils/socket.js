import { io } from 'socket.io-client'
import store from '@/store'
import { hydrateUserIdFromToken } from '@/utils/jwtUserId'

/**
 * Socket.IO v4 私聊 & 群聊协议
 * - 鉴权：query.token = JWT（与 Login 一致，使用 sessionStorage）
 * - 私聊 C→S：emit('msg', WsMsg)，S→C：on('message', WsMsg)，type 为 ack | private
 * - 群聊 C→S：emit('group_msg', WsGroupMsg)，S→C：on('group_message', WsGroupMsg)，type 为 ack | group
 */
function resolveSocketBaseUrl () {
  if (process.env.VUE_APP_SOCKET_URL) {
    return process.env.VUE_APP_SOCKET_URL
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

class SocketService {
  constructor () {
    this.socket = null
    this._replayBuffer = {}
    this._replayTimer = null
  }

  get connected () {
    return !!(this.socket && this.socket.connected)
  }

  get raw () {
    return this.socket
  }

  _bindMessageChannel () {
    if (!this.socket) return
    const handlePayload = raw => {
      const clientReceivedAt = Date.now()
      let data = raw
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      if (!data || typeof data !== 'object') return
      const t = data.type ?? data.Type
      const userId = store.state.userId
      switch (t) {
        case 'ack':
          store.commit('chatMessageAck', {
            receiver_id: data.receiver_id ?? data.receiverId,
            timestamp: data.timestamp != null ? Number(data.timestamp) : (data.Timestamp != null ? Number(data.Timestamp) : null),
            msg_type: data.msg_type ?? data.msgType
          })
          break
        case 'private':
          if (data.timestamp == null && data.Timestamp == null && data.create_time == null && data.createTime == null && data.msg_time == null && data.msgTime == null && data.time == null) {
            data._client_received_at = clientReceivedAt
          }
          store.commit('chatIncomingPrivate', { raw: data, userId })
          break
        default:
          break
      }
    }

    this.socket.on('message', handlePayload)
  }

  _bindGroupMessageChannel () {
    if (!this.socket) return
    const handleGroupPayload = raw => {
      const clientReceivedAt = Date.now()
      let data = raw
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      if (!data || typeof data !== 'object') return

      const t = data.type ?? data.Type

      if (t === 'group') {
        if (data.time_string == null && data.create_time == null && data.msg_time == null && data.timestamp == null) {
          data._client_received_at = clientReceivedAt
        }

        if (data.replay) {
          if (data.replay_seq === data.replay_total) {
            store.commit('finishGroupReplay', { groupId: data.group_id ?? data.groupId })
          }
          return
        }

        const gid = String(data.group_id ?? data.groupId)
        if (!this._replayBuffer[gid]) {
          this._replayBuffer[gid] = []
        }
        this._replayBuffer[gid].push(data)
        this._scheduleFlush()
        return
      }

      if (t === 'ack') {
        store.commit('groupMessageAck', {
          group_id: data.group_id ?? data.groupId,
          msg_type: data.msg_type ?? data.msgType
        })
      }
    }

    this.socket.on('group_message', handleGroupPayload)
  }

  _bindLifecycle () {
    if (!this.socket) return
    this.socket.on('connect', () => {
      store.commit('setSocketConnected', true)
    })
    this.socket.on('disconnect', () => {
      store.commit('setSocketConnected', false)
    })
    this.socket.on('connect_error', () => {
      store.commit('setSocketConnected', false)
    })
  }

  _scheduleFlush () {
    if (this._replayTimer !== null) return
    this._replayTimer = Promise.resolve().then(() => {
      this._flushReplayBuffer()
    })
  }

  _flushReplayBuffer () {
    this._replayTimer = null
    const buffer = this._replayBuffer
    this._replayBuffer = {}
    const keys = Object.keys(buffer)
    if (keys.length === 0) return
    const userId = store.state.userId
    store.commit('batchGroupIncomingMessages', { buffer, userId })
  }

  _clearReplayTimer () {
    if (this._replayTimer !== null) {
      clearTimeout(this._replayTimer)
      this._replayTimer = null
    }
  }

  connect () {
    const token = sessionStorage.getItem('token')
    if (!token || !token.trim()) {
      return
    }
    if (this.socket && this.socket.connected) {
      return
    }
    this._destroySocket()

    hydrateUserIdFromToken()

    const url = resolveSocketBaseUrl()
    this.socket = io(url, {
      path: '/socket.io/',
      transports: ['websocket'],
      query: { token: token.trim() }
    })
    this._bindLifecycle()
    this._bindMessageChannel()
    this._bindGroupMessageChannel()
  }

  _destroySocket () {
    if (!this.socket) return
    this._clearReplayTimer()
    this._replayBuffer = {}
    this.socket.off('message')
    this.socket.off('group_message')
    this.socket.off('connect')
    this.socket.off('disconnect')
    this.socket.off('connect_error')
    this.socket.disconnect()
    this.socket = null
    store.commit('setSocketConnected', false)
  }

  /** 主动离线（md.txt 第 5 节） */
  disconnect () {
    this._destroySocket()
  }

  /**
   * 文本私聊 msg_type = 1
   * @returns {boolean} 是否已发出（连接未就绪时返回 false）
   */
  emitPrivateText (receiverId, msg) {
    if (!this.socket || !this.socket.connected) return false
    const rid = Number(receiverId)
    const text = String(msg || '').trim()
    if (!rid || !text) return false
    this.socket.emit('msg', {
      type: 'private',
      receiver_id: rid,
      msg_type: 1,
      msg: text
    })
    return true
  }

  /**
   * 文件私聊 msg_type = 2（文件需先走上传接口拿到 URL）
   */
  emitPrivateFile (receiverId, fileUrl, fileName) {
    if (!this.socket || !this.socket.connected) return false
    const rid = Number(receiverId)
    const url = String(fileUrl || '').trim()
    if (!rid || !url) return false
    const name = fileName != null ? String(fileName) : ''
    this.socket.emit('msg', {
      type: 'private',
      receiver_id: rid,
      msg_type: 2,
      msg: url,
      file_url: url,
      file_name: name
    })
    return true
  }

  /**
   * 群聊文本 msg_type = 1
   */
  emitGroupText (groupId, msg) {
    if (!this.socket || !this.socket.connected) return false
    const gid = Number(groupId)
    const text = String(msg || '').trim()
    if (!gid || !text) return false
    this.socket.emit('group_msg', {
      type: 'group',
      group_id: gid,
      msg_type: 1,
      msg: text
    })
    return true
  }

  /**
   * 群聊文件 msg_type = 2（文件需先走上传接口拿到 URL）
   */
  emitGroupFile (groupId, fileUrl, fileName) {
    if (!this.socket || !this.socket.connected) return false
    const gid = Number(groupId)
    const url = String(fileUrl || '').trim()
    if (!gid || !url) return false
    const name = fileName != null ? String(fileName) : ''
    this.socket.emit('group_msg', {
      type: 'group',
      group_id: gid,
      msg_type: 2,
      msg: url,
      url: url,
      file_name: name
    })
    return true
  }

  /**
   * 群聊已读
   */
  emitGroupRead (groupId) {
    if (!this.socket || !this.socket.connected) return false
    const gid = Number(groupId)
    if (!gid) return false
    this.socket.emit('read_group', { group_id: gid })
    return true
  }
}

export default new SocketService()
