<template>
  <div class="phone">
    <div class="tel">
      <div class="title">
        <i class="iconfont icon-shouji"></i>
        <h4>手机号绑定</h4>
      </div>
      <div class="form">
        <div class="number">
          <span>手机号码</span>
          <input type="text" placeholder="请输入手机号码">
        </div>
        <div class="code">
          <span>短信验证码</span>
          <input type="text" placeholder="请输入验证码">
          <button><span>获取验证码</span></button>
        </div>
      </div>
      <div class="btn">
        <button>绑定</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhonePage'
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
.phone {
  width: 814px;
  min-height: 100vh;
  padding: 15px;
  background: #fafbfc;
  flex: 1;
}
.phone .tel {
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
.phone .tel .form div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.phone .tel .form .number input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.phone .tel .form .number input:hover {
  border-color: #2830D3;
}
.phone .tel .form .number input:focus {
  border-color: #2830D3;
}
.phone .tel .form .code input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.phone .tel .form .code input:hover {
  border-color: #2830D3;
}
.phone .tel .form .code input:focus {
  border-color: #2830D3;
}
.phone .tel .form .code button {
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
.phone .tel .form .code button:hover {
  background-color: #694EDB;
}
.phone .tel .form .code button:active {
  background-color: #5A3FB9;
}
.phone .tel .btn {
  margin-top: 20px;
  text-align: center;
}
.phone .tel .btn button {
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