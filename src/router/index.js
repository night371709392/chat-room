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

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login' , component: Login },
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
                { path: 'chat', component: ChatContent },
                { path: 'friend', component: Friend },
                { path: 'group', component: Group },
                { path: 'setting', component: Setting}
            ]
        }
    ]
})

export default router