<template>
  <div class="friend">
    <div class="list">
      <div class="header">
        <div class="ipt">
          <input type="text" placeholder="搜索">
        </div>
        <button><i class="iconfont icon-jiahao"></i></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FriendPage'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.friend {
  width: 260px;
  min-height: 100vh;
  border-right: 1px solid rgba(0, 0, 0, .08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, .05);
}
.friend .list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.friend .list .header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0px 12px;
}
.friend .list .header .ipt {
  width: 192px;
  height: 32px;
  line-height: 32px;
}
.friend .list .header .ipt input {
  width: 100%;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #fff;
}
.friend .list .header button {
  width: 32px;
  height: 32px;
  display: inline-block;
  margin: 5px;
  border-radius: 50%;
  border: 1px solid #fff;
  background-color: #F4F4FC;
}
.friend .list .header .iconfont {
  color: #3458DA;
  font-size: 16px;
  font-style: normal;
}
</style>