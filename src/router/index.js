import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Regist from '../views/Register/index.vue'
import UsernameRegist from '@/views/Register/Username.vue'
import PhoneRegist from '@/views/Register/Phone.vue'
import EmailRegist from '@/views/Register/Email.vue'
import ChatRoom from '@/views/ChatRoom/index.vue'
import ChatContent from '@/views/ChatRoom/chat.vue'
import Friend from '@/views/ChatRoom/friend.vue'
import Group from '@/views/ChatRoom/group.vue'
import Setting from '@/views/ChatRoom/setting.vue'
import Information from '@/views/Setting/information.vue'
import User from '@/views/Setting/user.vue'
import Phone from '@/views/Setting/phone.vue'
import Email from '@/views/Setting/email.vue'
import Password from '@/views/Setting/password.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { 
      path: '/regist', 
      component: Regist,
      children: [
        { path: '', redirect: 'username' },
        { path: 'username', component: UsernameRegist },
        { path: 'phone', component: PhoneRegist },
        { path: 'email', component: EmailRegist }
      ]
    },
    {   
      path: '/chathome', 
      component: ChatRoom,
      children: [
        { path: '', redirect: 'chat' },
        { path: 'chat', components: { main: ChatContent } },
        { path: 'friend', components: { main: Friend } },
        { path: 'group', components: { main: Group } },
        
        { path: 'setting', components: { main: Setting } },
        
        { path: 'setting/information', components: { 
            main: Setting,
            setting: Information
          }
        },
        { path: 'setting/phone', components: { 
            main: Setting,
            setting: Phone 
          } 
        },
        { path: 'setting/email', components: { 
            main: Setting,
            setting: Email 
          } 
        },
        { path: 'setting/password', components: { 
            main: Setting,
            setting: Password 
          } 
        },
        { path: 'setting/user', components: { 
            main: Setting,
            setting: User 
          } 
        }
      ]
    }
  ]
})

export default router