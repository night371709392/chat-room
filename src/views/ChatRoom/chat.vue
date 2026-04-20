<template>
  <div class="chat">
    <div class="list">
      <div class="ipt">
        <input type="text" placeholder="搜索">
      </div>
      <div class="message">
        <ContactItem
          v-for="item in chatFriendList"
          :key="item.id"
          :friend-detail="item"
        ></ContactItem>
      </div>
    </div>
  </div>
</template>

<script scoped>
import ContactItem from '@/components/ContactItem.vue'

export default {
  name: 'ChatPage',
  components: {
    ContactItem
  },
  data () {
    return {
      avatarUrl: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    }
  },
  computed: {
    activeSubStatus () {
      return this.$store.state.chatSubStatus
    },
    chatFriendList () {
      return this.$store.state.chatFriendList
    }
  },
  methods: {
    setSubStatus (status) {
      this.$store.commit('setChatSubStatus', status)
    }
  }
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
  flex: 1;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}
.chat .list .message .item {
  height: 64px;
  display: flex;
  position: relative;
  margin: 0 3px;
  padding: 5px 8px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 10px;
  user-select: none;
}
.chat .list .message .item:hover {
  background-color: #e8f3ff;
}
.chat .list .message .item .head-image {
  width: 45px;
  height: 45px;
}
.chat .list .message .item .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.chat .list .message .item .right {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding-left: 10px;
  text-align: left;
  overflow: hidden;
}
.chat .list .message .item .right .name-text {
  display: flex;
  justify-content: space-between;
}
.chat .list .message .item .right .name-text p {
  font-size: 14px;
  color: black;
}
.chat .list .message .item .right .name-text span {
  font-size: 12px;
  color: #808080;
}
.chat .list .message .item .right .content-text {
  font-size: 12px;
  color: #808080;
  overflow: hidden;
}
.item.active {
  background-color: #e8f3ff !important;
  border-left: 3px solid #2830d3;
}
.item:hover {
  background-color: #f5f7fa;
  cursor: pointer;
}
</style>