import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect() {
    const token = sessionStorage.getItem('token')
    if (!token) {
      console.warn('未获取到登录token')
      return
    }

    // ✅ 修复：写完整后端地址
    this.socket = io('http://192.168.0.158:8081', {  // 改成你后端真实端口！
      path: '/socket.io/',
      transports: ['websocket'],
      query: { token }
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket 连接成功')
      this.isConnected = true
    })

    this.socket.on('connect_error', (err) => {
      console.error('⚠️ 连接失败:', err.message)
    })
  }

  disconnect() {
    if (this.socket) this.socket.disconnect()
  }
}

export default new SocketService()