<template>
  <div class="information">
    <div class="profile-card">
      <div class="profile-header">
        <div class="img"></div>
        <div class="user-basic-info">
          <h3>星祈月</h3>
          <p>ID: 星祈月</p>
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
          <input type="text">
        </div>
        <div class="sex">
          <span>性别</span>
          <input type="radio" name="gender" value="male">男
          <input type="radio" name="gender" value="female">女
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
          <a href="">去绑定</a>
        </div>
        <div class="email">
          <span>邮箱</span>
          <p>未绑定邮箱</p>
          <a href="">去绑定</a>
        </div>
      </form>
    </div>
    <div class="sign">
      <div class="title">
        <i class="iconfont icon-gexingqianming"></i>
        <h4>个性签名</h4>
      </div>
      <textarea placeholder="分享你的心情和想法..."></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InformationPage'
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
}
.information .profile-card .profile-header .user-basic-info {
  flex: 1;
  text-align: left;
}
.information .profile-card .profile-header .user-basic-info h3 {
  font-size: 20px;
  margin: 0 0 6px;
  font-weight: 600;
}
.information .profile-card .profile-header .user-basic-info p {
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
</style>