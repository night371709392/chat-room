<template>
  <div class="notice">
    <div class="header">
      <span>系统通知</span>
    </div>
    <div class="main">

      <!-- 第一条通知 -->
      <div class="notice-item">
        <div class="time">11:55</div>
        <div class="card">
          <div class="title">警惕诈骗陷阱(新用户必看)</div>
          <div class="img-wrapper">
            <img src="@/assets/img/Chat/诈骗陷阱.png" alt="诈骗陷阱图" class="notice-img" />
          </div>
          <div class="content">
            如果你是被陌生人引导下载的盒子im，请你务必提高警惕，对方极有可能是骗子
          </div>
          <div class="detail-link">查看详情</div>
        </div>
      </div>

      <!-- 第二条通知 -->
       <div class="notice-item">
        <div class="time">02/14 23:35:33</div>
        <div class="card">
          <div class="title">"同城约app(裸聊)"是勒索骗局，请勿上当！</div>
          <div class="img-wrapper">
            <img src="@/assets/img/Chat/裸聊诈骗.jpg" alt="反诈提示图" class="notice-img" />
          </div>
          <div class="content">
            邀请“裸聊”的都是诈骗，视频被对方录制后将对您进行敲诈勒索，切勿相信！
          </div>
          <div class="detail-link">查看详情</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticePage',
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.notice {
  flex: 1;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}
.notice .header {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebeef5;
}
.notice .main {
  flex: 1;
  padding: 24px 12px;
  display: flex;
  flex-direction: column-reverse;
  gap: 28px;
  overflow-y: auto;
}
.notice-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.time {
  font-size: 12px;
  color: #999999;
  margin-bottom: 8px;
  text-align: center;
}
.card {
  width: 440px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  margin: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card .title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
}
.img-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
.notice-img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
}
.card .content {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  padding-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}
.detail-link {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
  align-self: flex-start;
}
.detail-link:hover {
  text-decoration: underline;
}
</style>