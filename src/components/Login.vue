<template>
  <div class="login-page">
    <div class="login-card">
      <h2>登录</h2>

      <div class="input-group">
        <input type="text" placeholder="邮箱号码" v-model="email">
      </div>
      <div class="input-group">
        <input type="password" placeholder="密码" v-model="password">
      </div>

      <div class="form-row">
        <label class="checkbox-wrap">
          <input type="checkbox">
          <span>下次自动登录</span>
        </label>
        <a href="#" class="link">忘记密码</a>
      </div>

      <!-- 将token保存在浏览器的本地存储，将JWT放在请求的头部Authorization字段中 -->
      <button class="login-btn" @click="handleLogin">登录</button>

      <button class="scan-btn">扫码登录</button>

      <div class="register-link">
        没有账号? 
        <router-link to="/regist">注册账号</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'
import socketService from '@/utils/socket'

export default {
  name: 'LoginPage',
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    // 校验邮箱
    validateEmail () {
      if (!this.email.trim()) {
        Toast("请输入邮箱地址")
        return false
      }
      if (!/^[\w.-]+@[\w.-]+\.\w+$/i.test(this.email)) {
        Toast("请输入正确的邮箱号码")
        return false
      }
      return true
    },

    // 校验密码
    validatePassword () {
      if (!this.password.trim()) {
        Toast("请输入密码")
        return false
      }
      if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(this.password)) {
        Toast("密码需为8-20位，包含字母和数字")
        return false
      }
      return true
    },

    handleLogin () {
      if (!this.validateEmail()) return
      if (!this.validatePassword()) return

      // this.$router.push('/chathome')

      this.$axios({
        url: '/api/user/login',
        method: 'post',
        data: {
          email: this.email,
          password: this.password
        }
      }).then(res => {
        if (res.data.msg === "success") {
          sessionStorage.setItem('token', res.data.token)
          socketService.connect()
          Toast("登录成功")
          this.$router.push('/chathome')
        }
        else {
          Toast(res.data.msg || '登录失败')
          return
        }
      })
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}
.login-page {
  min-height: 100vh;
  background: #6c7df7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.login-card {
  width: 360px;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
}
.login-card h2 {
  font-size: 22px;
  margin-bottom: 24px;
  color: #333;
}
.input-group {
  margin-bottom: 16px;
}
.input-group input {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 22px;
  padding: 0 18px;
  font-size: 14px;
  outline: none;
}
.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0 20px;
  font-size: 13px;
  user-select: none;
}
.checkbox-wrap {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.checkbox-wrap input {
  margin-right: 6px;
  width: 14px;
  height: 14px;
}
.link {
  color: #6c7df7;
  text-decoration: none;
  font-size: 13px;
}
.login-btn {
  width: 100%;
  height: 44px;
  background: #4e60ff;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 16px;
}

.scan-btn {
  width: 100%;
  height: 44px;
  background: #fff;
  color: #4e60ff;
  border: 1px solid #4e60ff;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 16px;
}

.register-link {
  font-size: 13px;
  color: #666;
}
.register-link a {
  color: #6c7df7;
  text-decoration: none;
}
</style>