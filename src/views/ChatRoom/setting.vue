<template>
  <div class="setting">
    <div>
      <i class="iconfont icon-moban"></i>
      <router-link to="/setting/information">个人资料</router-link>
    </div>
    <div>
      <i class="iconfont icon-shezhi"></i>
      <router-link to="/setting/user">用户设置</router-link>
    </div>
    <div>
      <i class="iconfont icon-shouji"></i>
      <router-link to="/setting/phone">绑定手机</router-link>
    </div>
    <div>
      <i class="iconfont icon-youxiang"></i>
      <router-link to="/setting/email">绑定邮箱</router-link>
    </div>
    <div>
      <i class="iconfont icon-mima"></i>
      <router-link to="/setting/password">修改密码</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingPage'
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.iconfont {
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: skyblue;
}
.setting {
  width: 260px;
  min-height: 100vh;
  border-right: 1px solid rgba(0, 0, 0, .08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, .05);
  display: flex;
  flex-direction: column;
}
.setting div {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  margin: 2px 0;
  gap: 12px;
}
.setting div:focus {
  background-color: #EAEAFB;
}
</style>