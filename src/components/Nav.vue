<template>
  <div class="nav">
    <div class="nav-top">
        <div class="avater" @click="toInformation">
          <img :src="avatarUrl" alt="">
        </div>
        <ul>
            <li title="消息">
                <router-link to="/chathome/chat">
                  <van-badge dot>
                    <i class="ri ri-message-3-line"></i>
                  </van-badge>
                </router-link>
            </li>
            <li title="朋友">
                <router-link to="/chathome/friend">
                  <van-badge dot>
                    <i class="ri ri-user-heart-line"></i>
                  </van-badge>
                </router-link>
            </li>
            <li title="群聊">
                <router-link to="/chathome/group">
                  <van-badge dot>
                    <i class="ri ri-team-line"></i>
                  </van-badge>
                </router-link>
            </li>
            <li title="设置">
                <router-link to="/chathome/setting">
                    <i class="ri ri-settings-3-line"></i>
                </router-link>
            </li>
        </ul>
    </div>
    <div class="nav-footer">
        <ul>
            <li title="退出登录" @click="logout"><a href="javascript:void(0)"><i class="ri ri-logout-box-r-line"></i></a></li>
        </ul>
    </div>
  </div>
</template>

<script>
import socketService from '@/utils/socket'

export default {
    name: 'NavPage',
    computed: {
      avatarUrl () {
        return this.$store.state.userPicture || this.$store.state.selectedAvatarUrl || 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
      }
    },
    methods: {
      logout() {
      sessionStorage.removeItem('token')
      socketService.disconnect()
      this.$store.commit('clearChatSession')
      this.$store.commit('setUserInfo', {
        name: '',
        gender: 0,
        picture: '',
        pictureId: null,
        signature: '',
        email: ''
      })
      this.$router.push('/login')
      },
      toInformation () {
        const targetPath = '/chathome/setting/information'
        if (this.$route.path !== targetPath) {
          this.$router.push(targetPath)
        }
      }
    }
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
ul {
  list-style: none;
}
a {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav {
    width: 68px;
    height: 100vh;
    background-color: #444BD8;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 25px 0;
}
.nav .nav-top {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}
.nav .nav-top .avater {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #326EB6;
    cursor: pointer;
}
.nav .nav-top .avater img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-image: cover;
}
.nav .nav-top ul {
    margin-top: 50px;
}
.nav .nav-top ul li {
    margin-top: 18px;
    display: flex;
    justify-content: center;
    width: 100%;
}
.nav .nav-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.nav .nav-top .ri {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.78);
    transition: color 0.22s ease, transform 0.22s ease, filter 0.22s ease;
}
.nav .nav-top ul li > a.router-link-active {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.16);
    box-shadow:
      0 4px 18px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.28);
}
.nav .nav-top ul li > a.router-link-active .ri {
    color: #fff;
    transform: scale(1.06);
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}
.nav .nav-top ul li > a:not(.router-link-active):hover .ri {
    color: #fff;
    transform: scale(1.04);
}
.nav .nav-footer .ri {
    font-size: 22px;
    color: rgba(255, 255, 255, 0.72);
    transition: color 0.2s ease, transform 0.2s ease;
}
.nav .nav-footer li:hover .ri {
    color: #ffb4b4;
    transform: scale(1.05);
}
</style>