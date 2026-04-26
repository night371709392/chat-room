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

<script>
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
  padding: 4px 0 8px;
}
/* 会话行与选中态样式在 ContactItem.vue */
</style>