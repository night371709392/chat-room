<template>
  <div class="nav">
    <div class="nav-top">
        <div class="avater"></div>
        <ul>
            <li title="消息"><router-link to="/chathome/chat"><i class="iconfont icon-xiaoxi"></i></router-link></li>
            <li title="朋友"><router-link to="/chathome/friend"><i class="iconfont icon-pengyou"></i></router-link></li>
            <li title="群聊"><router-link to="/chathome/group"><i class="iconfont icon-tongxunlu"></i></router-link></li>
            <li title="设置"><router-link to="/chathome/setting"><i class="iconfont icon-shezhi"></i></router-link></li>
        </ul>
    </div>
    <div class="nav-footer">
        <ul>
            <li title="退出登录"><a href=""><i class="iconfont icon-tuichu"></i></a></li>
        </ul>
    </div>
  </div>
</template>

<script>
export default {
    name: 'NavPage'
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
ul {
  list-style: none;
}
a {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav {
    width: 68px;
    height: 100vh;
    background-color: #444BD8;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 25px 0;
}
.nav .nav-top {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}
.nav .nav-top .avater {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #326EB6;
}
.nav .nav-top ul {
    margin-top: 50px;
}
.nav .nav-top ul li {
    margin-top: 25px;
    position: relative; /* 必须，为了定位左侧的竖线 */
    display: flex;
    justify-content: center;
}
.nav .nav-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.iconfont {
    font-size: 32px;
    color: white;
    transition: all 0.3s ease; /* 过渡动画，让高亮出现更平滑 */
}
.router-link-active {
    border-left: 3px solid #FFFFFF; 
    display: flex;
    justify-content: center;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}
</style>