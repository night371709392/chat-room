<template>
  <div class="friend">
    <div class="list">
      <div class="header">
        <div class="ipt">
          <input type="text" placeholder="搜索">
        </div>
        <button @click="openPage"><i class="iconfont icon-jiahao"></i></button>
      </div>

      <div class="item" @click="setSubStatus('newfriend')">
        <div class="head-image">
          <img src="@/assets/img/ChatRoom/newfriend.png" alt="">
        </div>
        <div class="right">
          <p>新的朋友</p>
        </div>
      </div>
      
      <!-- 好友列表渲染 -->
      <div class="item" @click="selectFriendDetail(item)" v-for="item in friendList" :key="item.friend_id">
        <div class="head-image">
          <img :src="item.friend_picture" alt="">
        </div>
        <div class="right">
          <p>{{ item.friend_name }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'FriendPage',
  data () {
    return {
      friendDetailAbortController: null
    }
  },
  computed: {
    friendList () {
      return this.$store.state.userFriendList
    }
  },
  beforeDestroy () {
    if (this.friendDetailAbortController) {
      this.friendDetailAbortController.abort()
      this.friendDetailAbortController = null
    }
  },
  methods: {
    openPage () {
      this.$store.commit('openAddFriendPage')
    },
    setSubStatus (status) {
      this.$store.commit('setChatSubStatus', status)
      // console.log('当前聊天子状态:', this.$store.state.chatSubStatus)
    },
    // 统一格式化好友信息
    normalizeFriendDetail (item) {
      const rawGender = item.gender ?? item.friend_gender
      let gender = item.genderText ?? item.friend_genderText ?? ''
      if (!gender) {
        if (rawGender === '男' || rawGender === '女') {
          gender = rawGender
        } else {
          gender = Number(rawGender) === 1 ? '女' : '男'
        }
      }
      return {
        id: item.id ?? item.friend_id ?? '',
        username: item.username ?? item.name ?? item.friend_name ?? '',
        nickname: item.nickname ?? item.remark ?? item.friend_remark ?? item.friend_name ?? item.name ?? '',
        gender,
        signature: item.signature ?? item.friend_signature ?? '这个人很懒，什么都没有留下',
        avatar: item.avatar ?? item.picture ?? item.friend_picture ?? ''
      }
    },

    selectFriendDetail (friendItem) {
      if (this.$store.state.chatSubStatus !== 'friend') {
        this.$store.commit('setChatSubStatus', 'friend')
      }
      this.loadFriendDetail(friendItem)
    },

    // 获取好友详情（快速切换时取消未完成请求，避免旧响应覆盖新选中好友）
    loadFriendDetail (friendItem) {
      if (this.friendDetailAbortController) {
        this.friendDetailAbortController.abort()
      }
      const controller = new AbortController()
      this.friendDetailAbortController = controller

      const friendId = friendItem.friend_id ?? friendItem.id
      const fallbackDetail = this.normalizeFriendDetail(friendItem)

      this.$store.commit('setCurrentFriendDetail', fallbackDetail)

      this.$axios.post('/api/contact/friend/main', { friend_id: friendId }, { signal: controller.signal })
        .then(res => {
          if (controller.signal.aborted) return
          const data = res.data?.friend ?? res.data?.data ?? res.data ?? {}
          const detail = this.normalizeFriendDetail({ ...fallbackDetail, ...data })
          this.$store.commit('setCurrentFriendDetail', detail)
        })
        .catch((err) => {
          if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return
        })
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
.friend {
  width: 260px;
  height: 100vh;
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
.friend .list .header .ipt input:hover {
  border-color: #2830D3;
}
.friend .list .header .ipt input:focus {
  border-color: #2830D3;
}
.friend .list .header button {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
  border-radius: 50%;
  border: 1px solid #fff;
  background-color: #F4F4FC;
  cursor: pointer;
}
.friend .list .header button:hover {
  color: #EAEAFB;
  transform: scale(1.1);
}
.friend .list .header .iconfont {
  color: #3458DA;
  font-size: 16px;
  font-style: normal;
}
.friend .list .item {
  height: 60px;
  display: flex;
  position: relative;
  padding: 5px 10px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, .08);
}
.friend .list .item .head-image {
  width: 45px;
  height: 45px;
}
.friend .list .item .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.friend .list .item .right {
  padding-left: 10px;
  text-align: left;
  flex: 1;
  font-size: 14px;
}
</style>