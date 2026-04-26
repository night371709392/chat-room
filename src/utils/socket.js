import { io } from 'socket.io-client'
import store from '@/store'

/**
 * Socket.IO v4 私聊（见 src/md.txt、src/ymal.txt）
 * - 鉴权：query.token = JWT（与 Login 一致，使用 sessionStorage）
 * - C→S：emit('msg', WsMsg)
 * - S→C：on('message', WsMsg)，type 为 ack | private
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
          store.commit('chatIncomingPrivate', { raw: data, userId })
          break
        default:
          break
      }
    }

    this.socket.on('message', handlePayload)
  }

  _bindLifecycle () {
    if (!this.socket) return
    this.socket.on('connect', () => {
      store.commit('setSocketConnected', true)
    })
    this.socket.on('disconnect', () => {
      store.commit('setSocketConnected', false)
    })
    this.socket.on('connect_error', err => {
      console.warn('[socket] connect_error', err && err.message)
      store.commit('setSocketConnected', false)
    })
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

    const url = resolveSocketBaseUrl()
    this.socket = io(url, {
      path: '/socket.io/',
      transports: ['websocket'],
      query: { token: token.trim() }
    })
    this._bindLifecycle()
    this._bindMessageChannel()
  }

  _destroySocket () {
    if (!this.socket) return
    this.socket.off('message')
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
}

export default new SocketService()
