<template>
  <div class="newfriend">
    <div class="header">
      新的朋友
    </div>
    <div class="el-tabs">
      <div class="get" :class="{ active: activeTab === 'get' }" @click="activeTab = 'get'">收到的申请(0)</div>
      <div class="post" :class="{ active: activeTab === 'post' }" @click="activeTab = 'post'">发起的申请(0)</div>
    </div>

    <!-- 内容区域 -->
    <div class="tab-content">
      <!-- 收到的申请 -->
      <div v-show="activeTab === 'get'" class="content-box">

        <div class="empty" v-show="getList.length === 0">暂无收到的好友申请</div>
        
        <div 
        class="apply-item" 
        v-for="(item, index) in getList" 
        :key="index">
          <div class="avatar"><img :src="item.send_pictures" alt=""></div>
          <div class="info">
            <div class="name">{{ item.send_name }}</div>
            <div class="msg">{{ item.msg }}</div>
          </div>
          <div class="btns">
            <button class="btn refuse" @click="refuse(item.send_id)">拒绝</button>
            <button class="btn agree" @click="accept(item.send_id)">同意</button>
          </div>
        </div>
        
      </div>

      <!-- 发起的申请 -->
      <div v-show="activeTab === 'post'" class="content-box">

        <div class="empty" v-show="postList.length === 0">暂无发起的好友申请</div>

        <div 
        class="apply-item" 
        v-for="(item, index) in postList" 
        :key="index">
          <div class="avatar"><img :src="item.send_pictures" alt=""></div>
          <div class="info">
            <div class="name">{{ item.send_name }}</div>
            <div class="msg">{{ item.msg }}</div>
          </div>
        </div>
       
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'

export default {
  name: 'NewFriendPage',
  data () {
    return {
      activeTab: 'get',
      getList: [],
      postList: []
    }
  },
  mounted () {
    // 收到的申请
    this.$axios({
      url: '/api/application/list',
      method: 'get'
    }).then(res => {
      // console.log(res)
      if (res.data.msg === 'success') {
        this.getList = res.data.list
      }
    })
    // 发起的申请
    this.$axios({
      url: '/api/application/mylist',
      method: 'get'
    }).then(res => {
      // console.log(res)
      if (res.data.msg === 'success') {
        this.postList = res.data.list
      }
    })
  },
  methods: {
    refuse (id) {
      this.$axios({
        url: '/api/application/refuse',
        method: 'put',
        data: {
          account_id: id
        }
      }).then(res => {
        console.log(res)
        if (res.data === 'success') {
          Toast('已拒绝好友申请')
          this.getList = this.getList.filter(item => item.send_id !== id)
        }
      })
    },
    accept (id) {
      this.$axios({
        url: '/api/application/accept',
        method: 'put',
        data: {
          account_id: id
        }
      }).then(res => {
        console.log(res)
        if (res.data === 'success') {
          Toast('已同意好友申请')
          this.getList = this.getList.filter(item => item.send_id !== id)
        }
      })
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
.newfriend {
  flex: 1;
  max-height: 100vh;
  background-color: #FCFDFF;
}
.newfriend .header {
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 18px;
}
.newfriend .el-tabs {
  display: flex;
  border-bottom: 1px solid #E4E7ED;
}
.newfriend .el-tabs div {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  list-style: none;
  font-size: 16px;
  border: 1px solid #E4E7ED;
  border-left: none;
  border-bottom: none;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}
.newfriend .el-tabs div:hover {
  position: relative;
  bottom: 2px;
}
.newfriend .el-tabs div.active {
  color: #409EFF;
  border-bottom: 2px solid #409EFF;
  font-weight: 500;
}

/* 以下为新增样式 */
.tab-content {
  padding: 10px;
}
.content-box {
  width: 100%;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  font-size: 14px;
}

/* 申请列表项 */
.apply-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #f0f2f5;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  flex: 1;
}
.name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}
.msg {
  font-size: 13px;
  color: #909399;
}
.btns {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-size: 13px;
  cursor: pointer;
}
.agree {
  background: #409EFF;
  color: #fff;
}
.refuse {
  background: #f5f7fa;
  color: #606266;
}
</style>