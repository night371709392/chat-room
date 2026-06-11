<template>
  <div class="chat">
    <div class="list">
      <div class="ipt">
        <input type="text" placeholder="搜索">
      </div>
      <div class="message">
        <ContactItem
          v-for="item in sortedChatFriendList"
          :key="(item.type || 'friend') + '-' + item.id"
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
    },
    /**
     * 会话列表按「最近一条消息时间」倒序，最新的置顶。
     * 依赖 messagesByFriend，新消息 / ack / 历史写入都会自动触发重排（响应式）。
     * 无本地消息时回退到 last_msg_time，保证刚拉到会话列表也有合理顺序。
     */
    sortedChatFriendList () {
      const msgs = this.$store.state.messagesByFriend
      const latestTime = item => {
        const list = msgs[String(item.id)] || []
        if (list.length) {
          const last = list[list.length - 1]
          const t = Number(last && last.timestamp)
          if (Number.isFinite(t) && t > 0) return t
        }
        const fallback = Number(item.last_msg_time)
        return Number.isFinite(fallback) ? fallback : 0
      }
      return [...this.chatFriendList].sort((a, b) => latestTime(b) - latestTime(a))
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