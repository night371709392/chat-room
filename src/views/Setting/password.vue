<template>
  <div class="password">
    <div class="word">
      <div class="title">
        <i class="iconfont icon-mima"></i>
        <h4>修改密码</h4>
      </div>
      <div class="form">
        <div class="old">
          <span>原密码</span>
          <input type="text" placeholder="">
        </div>
        <div class="new">
          <span>新密码</span>
          <input type="text" placeholder="">
        </div>
        <div class="sure">
          <span>确认密码</span>
          <input type="text" placeholder="">
        </div>
      </div>
      <div class="btn">
        <button>提交</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordPage'
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