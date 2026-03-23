<template>
  <div class="user">
    <div class="privacy">
      <div class="title">
        <i class="iconfont icon-mima"></i>
        <h4>隐私设置</h4>
      </div>
      <div class="setting-item">
        <span>加我为好友时需要验证</span>
        <van-switch v-model="checked1" size="16px" />
      </div>
    </div>
    <div class="inform">
      <div class="title">
        <i class="iconfont icon-tongzhi"></i>
        <h4>通知设置</h4>
      </div>
      <div class="setting-item">
        <span>新消息提示音</span>
        <van-switch v-model="checked2" size="16px" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserPage',
  data() {
    return {
      checked1: true,
      checked2: true
    }
  },
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
.icon-tongzhi {
  font-size: 24px;
}
.user {
  width: 814px;
  min-height: 100vh;
  padding: 15px;
  background: #fafbfc;
  flex: 1;
}
.user .privacy {
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
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  user-select: none;
  font-size: 14px;
}
.user .inform {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
  border: 1px solid #f0f0f0;
}
</style>