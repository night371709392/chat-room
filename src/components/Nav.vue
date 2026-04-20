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
                    <i class="iconfont icon-xiaoxi"></i>
                  </van-badge>
                </router-link>
            </li>
            <li title="朋友">
                <router-link to="/chathome/friend">
                  <van-badge dot>
                    <i class="iconfont icon-pengyou"></i>
                  </van-badge>
                </router-link>
            </li>
            <li title="群聊">
                <router-link to="/chathome/group">
                  <van-badge dot>
                    <i class="iconfont icon-tongxunlu"></i>
                  </van-badge>
                </router-link>
            </li>
            <li title="设置">
                <router-link to="/chathome/setting">
                    <i class="iconfont icon-shezhi"></i>
                </router-link>
            </li>
        </ul>
    </div>
    <div class="nav-footer">
        <ul>
            <li title="退出登录" @click="logout"><a href="javascript:void(0)"><i class="iconfont icon-tuichu"></i></a></li>
        </ul>
    </div>
  </div>
</template>

<script>
export default {
    name: 'NavPage',
    computed: {
      avatarUrl () {
        return this.$store.state.userPicture || this.$store.state.selectedAvatarUrl || 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
      }
    },
    methods: {
      logout() {
      // 1. 删除本地 token
      sessionStorage.removeItem('token')
      
      // 2. 清空 Vuex 里的所有用户信息（关键！）
      this.$store.commit('setUserInfo', {
        name: '',
        gender: 0,
        picture: '',
        pictureId: null,
        signature: '',
        email: ''
      })
      
      // 3. 跳转到登录页（必须！）
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
    margin-top: 25px;
    position: relative; /* 必须，为了定位左侧的竖线 */
    display: flex;
    justify-content: center;
}
.nav .nav-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.iconfont {
    font-size: 32px;
    color: white;
    transition: all 0.3s ease; /* 过渡动画，让高亮出现更平滑 */
}
.router-link-active {
    border-left: 3px solid #FFFFFF; 
    display: flex;
    justify-content: center;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}
</style>