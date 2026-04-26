import Vue from 'vue'
import 'remixicon/fonts/remixicon.css'
import App from './App.vue'
import router from './router/index'
import axios from 'axios'
import store from '@/store/index'
import socketService from '@/utils/socket'
import { hydrateUserIdFromToken } from '@/utils/jwtUserId'

if (sessionStorage.getItem('token')) {
  hydrateUserIdFromToken()
  socketService.connect()
}

import { Tabbar, TabbarItem, Icon, Toast, Popup, Cell, Switch, IndexBar, IndexAnchor, Badge } from 'vant'

Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Icon)
Vue.use(Toast)
Vue.use(Popup)
Vue.use(Cell)
Vue.use(Switch)
Vue.use(IndexBar)
Vue.use(IndexAnchor)
Vue.use(Badge)


// 请求拦截器：统一加 JWT
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  
  if (token && token.trim()) {
    // 标准 JWT 格式
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 响应拦截器：处理 token 过期
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      sessionStorage.removeItem('token')
      socketService.disconnect()
      store.commit('clearChatSession')
      Toast('登录已过期，请重新登录')
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.prototype.$socket = socketService


new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')

window.$store = store