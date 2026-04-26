<template>
  <div class="popup">
    <van-popup v-model="$store.state.chatNotePage" :style="{ width: '420px' }">
      <div class="header">
        <van-icon 
          name="cross" 
          class="close-icon"
          @click="closePage"
        />
        <span>聊天记录</span>
      </div>
      <div class="chat-history">
        <div class="search-wrapper">
          <input type="text" placeholder="搜索聊天记录">
          <div class="search">
            <i class="ri ri-search-line"></i>
          </div>
        </div>
        <div class="el-tabs">
          <div class="all" :class="{ active: activeTab === 'all' }" @click="setTab('all')">全部</div>
          <div :class="{ active: activeTab === 'text' }" @click="setTab('text')">文字</div>
          <div class="photo" :class="{ active: activeTab === 'image' }" @click="setTab('image')">图片</div>
        </div>
        <div class="content">
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="avater"></div>
            <div class="message">
              <div class="top">
                <span class="name">露芜衣</span>
                <span class="time">2024-06-01 12:00</span>
              </div>
              <div class="bottom">
                <span>这是一条测试消息</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Icon } from 'vant'

export default {
  name: 'ChatNote',
  components: {
    vanIcon: Icon
  },
  data() {
    return {
      // 默认高亮 “全部”
      activeTab: 'all'
    }
  },
  methods: {
    setTab (tab) {
      this.activeTab = tab
    },
    closePage () {
      this.$store.commit('closeChatNotePage')
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.search .ri {
  font-size: 22px;
  color: #606266;
}
.header {
  height: 48px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.close-icon {
  position: absolute;
  right: 18px;
  font-size: 20px;
  cursor: pointer;
}
.chat-history {
  display: flex;
  padding: 0 25px;
  flex-direction: column;
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.search-wrapper input {
  flex: 1;
  height: 32px;
  line-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all .3s ease;
  background-color: #fff;
}
.search-wrapper input:focus {
  border-color: #2830D3;
}
.search-wrapper input:hover {
  border-color: #2830D3;
}
.search {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-tabs {
  display: flex;
  text-align: center;
  border-bottom: 1px solid gray;
  margin: 0 0 15px;
  user-select: none;
}
.el-tabs div {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  display: inline-block;
  list-style: none;
  font-size: 14px;
  cursor: pointer;
}
.el-tabs .all {
  padding-left: 0;
}
.el-tabs .photo {
  padding-right: 0;
}
.el-tabs div.active {
  color: #2830D3;
  font-weight: bold;
}
.content {
  flex: 1;
  max-height: 45vh;
  overflow: auto;
}
.item {
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 10px;
  margin-right: 20px;
  display: flex;
  margin-bottom: 10px;
}
.avater {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #326EB6;
}
.message {
  margin-left: 10px;
  text-align: left;
}
.top {
  display: flex;
  flex-wrap: nowrap;
  color: gray;
  font-size: 14px;
  line-height: 20px;
  gap: 12px;
}
</style>