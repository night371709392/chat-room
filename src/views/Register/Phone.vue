<template>
  <div class="phone-regist">
    <div class="input-group">
      <input type="tel" placeholder="手机号码">
    </div>
    
    <div class="input-group verification">
      <input type="text" placeholder="短信验证码">
      <button class="get-code">
        获取验证码
      </button>
    </div>
    
    <div class="input-group">
      <input type="password" placeholder="密码">
    </div>
    
    <div class="input-group">
      <input type="password" placeholder="确认密码">
    </div>
    
    <button class="register-btn">注册</button>
  </div>
</template>

<script>
export default {
  name: 'PhoneRegist',
}
</script>

<style scoped>
.phone-regist {
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