<template>
  <div class="information">
    <div class="profile-card">
      <div class="profile-header">
        <div class="img" @click="ChooseAvatar">
          <img :src="avatarUrl" alt="头像">
        </div>
        <div class="user-basic-info">
          <h3>{{ $store.state.userName }}</h3>
          <p>ID: {{ $store.state.userName }}</p>
        </div>
      </div>
    </div>
    <div class="info">
      <div class="title">
        <i class="iconfont icon-moban"></i>
        <h4>基本信息</h4>
      </div>
      <form class="el-form">
        <div class="nickname">
          <span>昵称</span>
          <input type="text" v-model="nickname" :placeholder="$store.state.userName">
        </div>
        <div class="sex">
          <span>性别</span>
          <label>
            <input type="radio" name="gender" :value="0" v-model="gender">男
          </label>
          <label>
            <input type="radio" name="gender" :value="1" v-model="gender">女
          </label>
        </div>
      </form>
    </div>
    <div class="phone">
      <div class="title">
        <i class="iconfont icon-shouji"></i>
        <h4>联系方式</h4>
      </div>
      <form class="el-form">
        <div class="number">
          <span>手机号</span>
          <p>未绑定手机号</p>
          <router-link to="/chathome/setting/email">去绑定</router-link>
        </div>
        <div class="email">
          <span>邮箱</span>
          <p>{{ $store.state.userEmail || '未绑定邮箱' }}</p>
          <router-link to="/chathome/setting/email">修改</router-link>
        </div>
      </form>
    </div>
    <div class="sign">
      <div class="title">
        <i class="iconfont icon-gexingqianming"></i>
        <h4>个性签名</h4>
      </div>
      <textarea :placeholder="$store.state.userSignature || '分享你的心情和想法...'" v-model="signature"></textarea>
    </div>
    <div class="btn">
      <button type="button" @click="submit"><span>提交</span></button>
    </div>

  </div>
</template>

<script>
import { Toast, Dialog } from 'vant'

export default {
  name: 'InformationPage',
  data() {
    return {
      nickname: '',
      signature: '',
      gender: 0,
      avatarUrl: '',
      picture_id: null,
      showAvatarPreview: false
    }
  },
  watch: {
    '$store.state.selectedAvatarId' (newId) {
      if (newId) {
        this.picture_id = newId
      }
    },
    '$store.state.selectedAvatarUrl' (newUrl) {
      if (newUrl) {
        this.avatarUrl = newUrl
      }
    },
    '$store.state.userGender' () {
      this.initForm()
    },
    '$store.state.userPicture' () {
      this.initForm()
    },
    '$store.state.userPictureId' () {
      this.initForm()
    }
  },
  mounted() {
    // 页面加载 → 自动从 Vuex 赋值所有数据
    this.initForm()
  },
  methods: {
    normalizeGender(value) {
      return Number(value) === 1 ? 1 : 0
    },
    // 初始化表单：从仓库拿数据
    initForm() {
      this.nickname = this.$store.state.userName || ''
      this.signature = this.$store.state.userSignature || ''
      this.gender = this.normalizeGender(this.$store.state.userGender)
      this.avatarUrl = this.$store.state.selectedAvatarUrl || this.$store.state.userPicture || 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
      const storePictureId = this.$store.state.selectedAvatarId ?? this.$store.state.userPictureId
      this.picture_id = storePictureId ?? null
    },

    ChooseAvatar () {
      this.$store.commit('openAvatarPage')
    },

    submit() {
      const currentPictureId = this.$store.state.selectedAvatarId ?? this.$store.state.userPictureId ?? this.picture_id
      const payload = {
        gender: this.normalizeGender(this.gender),
        name: this.nickname || this.$store.state.userName,
        signature: this.signature
      }
      if (currentPictureId !== null && currentPictureId !== undefined) {
        payload.picture_id = currentPictureId
      }

      Dialog.confirm({
        title: '修改信息',
        message: '确定要修改个人信息吗？',
      }).then(() => {
        // 确认修改
        this.$axios({
          url: '/api/user/create',
          method: 'post',
          data: payload
        }).then(res => {
          console.log(res)
          if (res.data === "success") {
            this.$store.commit('setUserInfo', {
              name: payload.name,
              gender: payload.gender,
              picture: this.avatarUrl || this.$store.state.userPicture,
              pictureId: currentPictureId,
              signature: payload.signature,
              email: this.$store.state.userEmail
            })
            Toast("修改成功")
          } 
          else {
            Toast("修改失败")
          }
        }).catch(() => {
          Toast("请求失败，请稍后重试")
        })
      }).catch(() => {
        Toast("已取消修改")
      })
    }
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
.information {
  width: 814px;
  min-height: 100vh;
  padding: 15px;
  background: #fafbfc;
  flex: 1;
}
.information .profile-card {
  background: hsla(0, 0%, 100%, .95);
  border-radius: 12px;
  padding: 20px 25px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .08);
  border: 1px solid rgba(0, 0, 0, .06);
  backdrop-filter: blur(10px);
}
.information .profile-card .profile-header {
  display: flex;
  align-items: center;
  gap: 25px;
}
.information .profile-card .profile-header .img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #326EB6;
  cursor: pointer;
}
.information .profile-card .profile-header .img img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-preview-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, .75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}
.avatar-preview-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, .35);
  object-fit: contain;
}
.information .profile-card .user-basic-info {
  flex: 1;
  text-align: left;
}
.information .profile-card .user-basic-info h3 {
  font-size: 20px;
  margin: 0 0 6px;
  font-weight: 600;
}
.information .profile-card .user-basic-info p {
  font-size: 14px;
  color: #808080;
}
.information .info {
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
.information .info .el-form div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.el-form .nickname input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.el-form .nickname input:hover {
  border-color: #2830D3;
}
.el-form .nickname input:focus {
  border-color: #2830D3;
}
.information .phone {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
  border: 1px solid #f0f0f0;
}
.information .phone .el-form div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 16px;
}
.information .phone .el-form div span {
  width: 60px;
  flex-shrink: 0;
}
.information .phone .el-form div p {
  flex: 1;
  margin: 0 15px;
  color: #909399;
}
.information .phone .el-form div a {
  color: #409eff;
  text-decoration: none;
  white-space: nowrap;
}
.information .phone .el-form div a:hover {
  text-decoration: underline;
}
.information .sign {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
  border: 1px solid #f0f0f0;
}
.information .sign textarea {
  width: 100%;
  max-width: 100%;
  min-height: 80px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
  font-size: 14px;
  overflow: hidden;
}
.information .sign textarea:hover {
  border-color: #2830D3;
}
.information .sign textarea:focus {
  border-color: #2830D3;
}
.btn {
  margin-top: 20px;
  text-align: center;
}
.btn button {
  padding: 10px 28px;
  font-size: 14px;
  background-color: #2830D3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>