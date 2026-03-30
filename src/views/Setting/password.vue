<template>
  <div class="password">
    <div class="word">
      <div class="title">
        <i class="iconfont icon-mima"></i>
        <h4>修改密码</h4>
      </div>
      <div class="form">
        <div class="code">
          <span>验证码</span>
          <input type="text" placeholder="邮件验证码" v-model="code">
          <button class="get-code" @click="getCode" :disabled="second !== totalSecond">
            {{ second === totalSecond ? '获取验证码' : second + '秒后重新发送' }}
          </button>
        </div>
        <div class="new">
          <span>新密码</span>
          <input type="password" placeholder="" v-model="new_password">
        </div>
      </div>
      <div class="btn">
        <button @click="alterPassword">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast, Dialog } from 'vant'

export default {
  name: 'PasswordPage',
  data () {
    return {
      code: '',
      new_password: '',
      totalSecond: 60, // 总秒数
      second: 60, // 当前秒数，开定时器对 second--
      timer: null // 定时器id
    }
  },
  methods: {
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
      if (!this.new_password.trim()) {
        Toast("请输入密码")
        return false
      }
      if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(this.new_password)) {
        Toast("密码需为8-20位，包含字母和数字")
        return false
      }
      return true
    },

    // 获取邮箱验证码
    getCode () {
      // 正在倒计时，禁止重复点击
      if (this.timer !== null || this.second !== this.totalSecond) {
        Toast('请稍后再获取验证码')
        return
      }

      // 先加载提示，提升体验
      Toast.loading({
        message: '发送中...',
        forbidClick: true,
        duration: 0
      })

      // 先发送请求 → 成功后再开启倒计时
      this.$axios({
        url: '/api/user/pwd/code/send',
        method: 'post',
      }).then(res => {
        Toast.clear()

        if (res.data === "success") {
          Toast("验证码已发送至您的邮箱，请注意查收")
      
          // ✅ 接口成功后，才开启倒计时
          this.startTimer()
        }
        else {
          Toast(res.data)
        }
        console.log(res)
      }).catch(() => {
        Toast.clear()
        Toast('发送失败，请重试')
      })
    },

    // 新增：单独封装倒计时方法
    startTimer () {
      this.timer = setInterval(() => {
        this.second--
        if (this.second <= 0) {
          clearInterval(this.timer)
          this.timer = null
          this.second = this.totalSecond
        }
      }, 1000)
    },

    // 修改密码
    alterPassword () {
      if (!this.validateCode()) return
      if (!this.validatePassword()) return

      Dialog.confirm({
        title: '修改密码',
        message: '确认修改密码？',
      }).then(() => {
        this.$axios({
          url: '/api/user/update/pwd',
          method: 'put',
          data: {
            code: this.code,
            new_password: this.new_password
          }
        }).then(res => {
          if (res.data === "success") {
            alert("密码修改成功，请重新登录")
            sessionStorage.removeItem("token")
            this.$router.push("/login")
          }
          else {
            Toast(res.data)
            return
          }
        })
      }).catch(() => {
        return
      })
    }
  },
  // 离开页面，清除定时器
  destroyed () {
    clearInterval(this.timer)
    this.timer = null
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.iconfont {
  font-size: 16px;
  color: skyblue;
}
.password {
  width: 814px;
  min-height: 100vh;
  padding: 15px;
  background: #fafbfc;
  flex: 1;
}
.password .word {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
  border: 1px solid #f0f0f0;
}
.title {
  margin: 0 0 15px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 18px;
}
.password .word .form div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px; 
}
.password .word .form input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.password .word .form input:hover {
  border-color: #2830D3;
}
.password .word .form input:focus {
  border-color: #2830D3;
}
.get-code {
  width: 120px;
  height: 32px;
  background: #f0f2f5;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 13px;
  color: #4e60ff;
  cursor: pointer;
  white-space: nowrap;
}
.get-code:disabled {
  color: #999;
  cursor: not-allowed;
}
.password .word .btn {
  margin-top: 20px;
  text-align: center;
}
.password .word .btn button {
  width: 84px;
  height: 34px;
  background-color: #2830D3;
  color: #FFFFFF;
  font-size: 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
</style>