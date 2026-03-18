import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import axios from 'axios'

import { Tabbar, TabbarItem, Icon, Toast } from 'vant'

Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Icon)
Vue.use(Toast)

Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')