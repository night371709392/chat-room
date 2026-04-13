<template>
  <div class="popup">
    <van-popup v-model="$store.state.addFriendPage" :style="{ width: '560px' }" class="add-friend-popup">
      <div class="header">
        <van-icon 
          name="cross" 
          class="close-icon" 
          @click="closePage"
        />
        <span class="title">添加好友</span>
      </div>
      <div class="body">
        <div class="search-wrapper">
          <input type="text" placeholder="ID/昵称/手机号/邮箱,最多展示20条" v-model="text">
          <div class="search" @click="SearchFriend">
            <i class="iconfont icon-sousuo"></i>
          </div>
        </div>
        <div class="list">
          <div class="item">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">蜜橘初夏</div>
              <div class="id">ID:露芜衣</div>
            </div>
            <button><span>添加好友</span></button>
          </div>
          <div class="item">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">蜜橘初夏</div>
              <div class="id">ID:露芜衣</div>
            </div>
            <button><span>添加好友</span></button>
          </div>
          <div class="item">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">蜜橘初夏</div>
              <div class="id">ID:露芜衣</div>
            </div>
            <button><span>添加好友</span></button>
          </div>
          <div class="item">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">蜜橘初夏</div>
              <div class="id">ID:露芜衣</div>
            </div>
            <button><span>添加好友</span></button>
          </div>
          <div class="item">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">蜜橘初夏</div>
              <div class="id">ID:露芜衣</div>
            </div>
            <button><span>添加好友</span></button>
          </div>
          <div class="item">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">蜜橘初夏</div>
              <div class="id">ID:露芜衣</div>
            </div>
            <button><span>添加好友</span></button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Icon } from 'vant'
import { Toast } from 'vant'

export default {
  name: 'AddFriend',
  data () {
    return {
      text: ''
    }
  },
  components: {
    vanIcon: Icon
  },
  methods: {
    closePage () {
      this.$store.commit('closeAddFriendPage')
    },
    // 校验邮箱
    validateEmail (val) {
      return /^[\w.-]+@[\w.-]+\.\w+$/i.test(val)
    },

    SearchFriend () {
      if (!this.text.trim()) {
        Toast("请输入搜索内容")
        return
      }

      const content = this.text.trim()

      // 邮箱搜索
      if (this.validateEmail(content)) {
        this.$axios({
          url: '/api/application/search/email',
          method: 'get',
          params: {
            email: content
          }
        }).then(res => {
          console.log(res)
        })
      }
      // ID搜索
      else {
        this.$axios({
          url: '/api/application/search/name',
          method: 'post',
          data: {
            name: content
          }
        }).then(res => {
          console.log(res)
        })
      }
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
.iconfont {
  font-size: 24px;
  color: black;
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
.title {
  font-size: 16px;
}
.body {
  max-height: 500px;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
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
.body .list {
  flex: 1;
  overflow: auto;
}
.body .list .item {
  height: 65px;
  display: flex;
  padding-left: 15px;
  align-items: center;
  padding-right: 25px;
}
.body .list .item .avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #326EB6;
}
.body .list .item .info {
  margin: 0 15px;
  flex: 3;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.body .list .item .info .name {
  font-size: 16px;
  line-height: 25px;
}
.body .list .item .info .id {
  font-size: 12px;
}
.body .list .item button {
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  color: #2830D3;
  background-color: rgb(234, 234, 251);
  cursor: pointer;
}
</style>