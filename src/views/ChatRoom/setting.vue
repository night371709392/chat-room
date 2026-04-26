<template>
  <div class="setting">
    <div>
      <i class="ri ri-layout-grid-line"></i>
      <router-link to="/chathome/setting/information" class="setting-link" exact>个人资料</router-link>
    </div>
    <div>
      <i class="ri ri-settings-3-line"></i>
      <router-link to="/chathome/setting/user" class="setting-link" exact>用户设置</router-link>
    </div>
    <div>
      <i class="ri ri-smartphone-line"></i>
      <router-link to="/chathome/setting/phone" class="setting-link" exact>绑定手机</router-link>
    </div>
    <div>
      <i class="ri ri-mail-line"></i>
      <router-link to="/chathome/setting/email" class="setting-link" exact>修改邮箱</router-link>
    </div>
    <div>
      <i class="ri ri-lock-password-line"></i>
      <router-link to="/chathome/setting/password" class="setting-link" exact>修改密码</router-link>
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
.setting > div > .ri {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #5b8ff9;
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
.setting-link {
  text-decoration: none;
  color: #333;
  font-size: 16px;
}
.setting-link.router-link-exact-active {
  color: #409eff;
  font-weight: 600;
}
</style>