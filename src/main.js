import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import axios from 'axios'
import store from '@/store/index'

import { Tabbar, TabbarItem, Icon, Toast, Popup, Cell } from 'vant'

Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Icon)
Vue.use(Toast)
Vue.use(Popup)
Vue.use(Cell)

Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')

window.$store = store