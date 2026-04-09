<template>
  <div class="email">
    <div class="mail">
      <div class="title">
        <i class="iconfont icon-youxiang"></i>
        <h4>修改邮箱</h4>
      </div>
      <div class="form">
        <div class="number">
          <span>新邮箱</span>
          <input type="text" placeholder="请输入新邮箱地址" v-model="new_email">
        </div>
        <div class="code">
          <span>邮件验证码</span>
          <input type="text" placeholder="请输入验证码" v-model="code">
          <button @click="getCode" :disabled="second !== totalSecond">
            <span>{{ second === totalSecond ? '获取验证码' : second + '秒后重新发送' }}</span>
          </button>
        </div>
      </div>
      <div class="btn">
        <button @click="alertEmail">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast, Dialog } from 'vant'

export default {
  name: 'EmailPage',
  data () {
    return {
      code: '',
      new_email: '',
      totalSecond: 60, // 总秒数
      second: 60, // 当前秒数，开定时器对 second--
      timer: null // 定时器id
    }
  },
  methods: {
    // 校验新邮箱
    validateEmail () {
      if (!this.new_email.trim()) {
        Toast("请输入邮箱地址")
        return false
      }
      if (!/^[\w.-]+@[\w.-]+\.\w+$/i.test(this.new_email)) {
        Toast("请输入正确的邮箱号码")
        return false
      }
      return true
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
    // 获取邮箱验证码
    getCode () {
      if (!this.validateEmail()) return

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
        url: '/api/email/send',
        method: 'post',
        data: {
          email: this.new_email
        }
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

    // 绑定新邮箱
    alertEmail () {
      if (!this.validateCode()) return

      Dialog.confirm({
        title: '修改邮箱',
        message: '确认修改邮箱？',
      }).then(() => {
        this.$axios({
          url: '/api/user/update/email',
          method: 'put',
          data: {
            code: this.code,
            new_email: this.new_email
          }
        }).then(res => {
          console.log(res)
          if (res.data === "success") {
            alert("邮箱修改成功，请重新登录")
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
.email {
  width: 814px;
  min-height: 100vh;
  padding: 15px;
  background: #fafbfc;
  flex: 1;
}
.email .mail {
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
.email .mail .form div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.email .mail .form .number input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.email .mail .form .number input:hover {
  border-color: #2830D3;
}
.email .mail .form .number input:focus {
  border-color: #2830D3;
}
.email .mail .form .code input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.email .mail .form .code input:hover {
  border-color: #2830D3;
}
.email .mail .form .code input:focus {
  border-color: #2830D3;
}
.email .mail .form .code button {
  width: 108px;
  height: 32px;
  background-color: #7B61FF;
  color: #FFFFFF;
  font-size: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.email .mail .form .code button:hover {
  background-color: #694EDB;
}
.email .mail .form .code button:active {
  background-color: #5A3FB9;
}
.email .mail .btn {
  margin-top: 20px;
  text-align: center;
}
.email .mail .btn button {
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