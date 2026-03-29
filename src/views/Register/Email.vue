<template>
  <div class="email-regist">
    <div class="input-group">
      <input type="email" placeholder="邮箱" v-model="email">
    </div>
    
    <div class="input-group verification">
      <input type="text" placeholder="邮件验证码" v-model="code">
      <button class="get-code" @click="getCode">
        {{ second === totalSecond ? '获取验证码' : second + '秒后重新发送' }}
      </button>
    </div>
    
    <div class="input-group">
      <input type="password" placeholder="密码" v-model="password">
    </div>
    
    <div class="input-group">
      <input type="password" placeholder="确认密码" v-model="re_password">
    </div>
    
    <button class="register-btn" @click="handleRegist">注册</button>
  </div>
</template>

<script>
import { Toast } from 'vant'

export default {
  name: 'EmailRegist',
  data () {
    return {
      email: '',
      code: '',
      password: '',
      re_password: '',
      totalSecond: 10, // 总秒数
      second: 10, // 当前秒数，开定时器对 second--
      timer: null // 定时器id
    }
  },
  methods: {
    // 校验邮箱
    validateEmail () {
      if (!this.email.trim()) {
        Toast("请输入邮箱地址")
        return false
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
        Toast("请输入正确的邮箱号码")
        return false
      }
      return true
    },

    // 校验验证码
    validateCode () {
      if (!this.code.trim()) {
        Toast("请输入验证码")
        return false
      }
      if (!/^\d{6}$/.test(this.code)) {
        Toast("请输入6位数字的验证码")
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

    // 校验确认密码
    validateRePassword () {
      if (!this.re_password.trim()) {
        Toast("请确认密码")
        return false
      }
      if (this.re_password !== this.password) {
        Toast("两次输入的密码不一致")
        return false
      }
      return true
    },

    // 获取邮箱验证码
    getCode () {
      if (!this.validateEmail()) {
        return
      }

      // 当前没有定时器，且 totalSecond 和 second 一致时才可以倒计时
      if (this.timer === null && this.second === this.totalSecond) {
        this.timer = setInterval(() => {
          this.second--
          if (this.second <= 0) {
            clearInterval(this.timer)
            this.timer = null
            this.second = this.totalSecond
          }
        }, 1000)
      }
      this.$axios({
        url: '/api/email/send',
        method: 'post',
        data: {
          email: this.email
        }
      }).then(res => {
        Toast("验证码已发送至您的邮箱，请注意查收")
        console.log(res)
      })
    },

    handleRegist () {
      if (!this.validateEmail()) return
      if (!this.validateCode()) return
      if (!this.validatePassword()) return
      if (!this.validateRePassword()) return
      this.$router.push('/login')
    }

  },
  // 离开页面，清除定时器
  destroyed () {
    clearInterval(this.timer) 
  }
}
</script>

<style scoped>
.email-regist {
  width: 100%;
}

.input-group {
  margin-bottom: 16px;
  position: relative;
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

.input-group input:focus {
  border-color: #4e60ff;
}

/* 验证码行样式 */
.verification {
  display: flex;
  gap: 10px;
}

.verification input {
  flex: 1;
}

.get-code {
  width: 110px;
  height: 44px;
  background: #f0f2f5;
  border: 1px solid #ddd;
  border-radius: 22px;
  font-size: 13px;
  color: #4e60ff;
  cursor: pointer;
  white-space: nowrap;
}

.get-code:disabled {
  color: #999;
  cursor: not-allowed;
}

.word-count {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
}

/* 针对用户名输入框的字数统计定位 */
.email-regist .input-group:has(input[placeholder="用户名"]) .word-count {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.register-btn {
  width: 100%;
  height: 44px;
  background: #4e60ff;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  margin: 0 0 10px;
}

.register-btn:hover {
  background: #3a4bdb;
}
</style>