<template>
  <div class="register-page">
    <div class="register-card">
      <h2>用户注册</h2>
      
      <!-- 注册方式切换 -->
      <div class="tab-nav">
        <router-link to="/regist/username" class="tab-item">
          用户名注册
        </router-link>
        <router-link to="/regist/phone" class="tab-item">
          手机注册
        </router-link>
        <router-link to="/regist/email" class="tab-item">
          邮箱注册
        </router-link>
      </div>

      <router-view></router-view>

      <div class="register-footer">
        <div class="register-link">
          已有账号？<router-link to="/login">去登录</router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegistPage',
  mounted() {
    if (this.$route.path === '/regist') {
      this.$router.push('/regist/username')
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

.register-page {
  min-height: 100vh;
  background: #6c7df7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.register-card {
  width: 400px;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
}

.register-card h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

/* 导航标签样式 */
.tab-nav {
  display: flex;
  justify-content: space-around;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 8px 0;
  color: #666;
  text-decoration: none;
  font-size: 15px;
  position: relative;
  flex: 1;
  text-align: center;
}

/* 使用 router-link-active 类实现高亮 */
.router-link-active {
  color: #4e60ff;
  font-weight: 500;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #4e60ff;
}
</style>