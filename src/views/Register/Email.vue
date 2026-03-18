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
      <input type="text" placeholder="用户名" maxlength="20">
      <span class="word-count">0/20</span>
    </div>
    
    <div class="input-group">
      <input type="password" placeholder="密码" v-model="password">
    </div>
    
    <div class="input-group">
      <input type="password" placeholder="确认密码" v-model="re_password">
    </div>
    
    <button class="register-btn">注册</button>
  </div>
</template>

<script>
import { Toast } from 'vant';

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
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
        this.$toast("请输入正确的邮箱号码")
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
  margin: 20px 0 10px;
}

.register-btn:hover {
  background: #3a4bdb;
}
</style>