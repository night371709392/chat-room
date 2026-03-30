import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import axios from 'axios'
import store from '@/store/index'

import { Tabbar, TabbarItem, Icon, Toast, Popup, Cell, Switch } from 'vant'

Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Icon)
Vue.use(Toast)
Vue.use(Popup)
Vue.use(Cell)
Vue.use(Switch)


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
      // 登录过期
      sessionStorage.removeItem('token')
      Toast('登录已过期，请重新登录')
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')

window.$store = store