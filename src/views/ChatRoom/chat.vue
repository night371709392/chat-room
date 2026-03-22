<template>
  <div class="chat">
    <div class="list">
      <div class="ipt">
        <input type="text" placeholder="搜索">
      </div>
      <div class="message">
        <div class="item1">
          <div class="head-image">
            <img src="@/assets/img/ChatRoom/notice.png" alt="">
          </div>
          <div class="right">
            <div class="name-text">
              <p>系统通知</p>
              <span>01/29</span>
            </div>
            <div class="content-text">"同城约app"是勒索骗局，请勿上当受骗！</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatPage'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.chat {
  width: 260px;
  min-height: 100vh;
  border-right: 1px solid rgba(0, 0, 0, .08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, .05);
}
.chat .list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chat .list .ipt {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.chat .list .ipt input {
  height: 32px;
  line-height: 32px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  padding: 0 10px;
}
.chat .list .ipt input:hover {
  border-color: #2830D3;
}
.chat .list .ipt input:focus {
  border-color: #2830D3;
}
.chat .list .message {
  display: flex;
  flex-direction: column;
}
.chat .list .message .item1 {
  height: 54px;
  display: flex;
  position: relative;
  margin: 0 3px;
  padding: 5px 8px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 10px;
}
.chat .list .message .item1 .head-image {
  width: 45px;
  height: 45px;
}
.chat .list .message .item1 .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.chat .list .message .item1 .right {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding-left: 10px;
  text-align: left;
  overflow: hidden;
}
.chat .list .message .item1 .right .name-text {
  display: flex;
  justify-content: space-between;
}
.chat .list .message .item1 .right .name-text p {
  font-size: 14px;
  color: black;
}
.chat .list .message .item1 .right .name-text span {
  font-size: 12px;
  color: #808080;
}
.chat .list .message .item1 .right .content-text {
  font-size: 12px;
  color: #808080;
  overflow: hidden;
}
</style>