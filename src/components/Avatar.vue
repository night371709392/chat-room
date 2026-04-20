<template>
  <div class="avatar">
    <van-popup v-model="$store.state.avatarPage" :style="{ width: '520px', borderRadius: '8px' }" class="avatar-popup">
      <div class="header">
        <van-icon 
          name="cross" 
          class="close-icon" 
          @click="closePage"
        />
        <span class="title">选择头像</span>
      </div>
      <div class="content">
        <div 
          class="item" 
          v-for="(item, index) in avatarList" 
          :key="item.id" 
          @click="selectAvatar(item, index)"
        >
          <img :src="item.web">
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'AvatarPage',
  data () {
    return {
      avatarList: [],
      selectedId: null
    }
  },
  methods: {
    selectAvatar (item, index) {
      this.selectedId = item.id || (index + 1)
      // 存入 Vuex
      this.$store.commit('setSelectedAvatar', {
        id: this.selectedId,
        url: item.web
      })
      this.closePage()
    },
    closePage () {
      this.$store.commit('closeAvatarPage')
    }
  },
  mounted () {
    this.$axios({
      url: '/api/user/show/pictures',
      method: 'post'
    }).then(res => {
      this.avatarList = res.data.picture
    })
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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
.content {
  max-height: 500px;
  padding: 10px 20px;
  display: flex;
  flex-wrap: wrap;
  /* 让滚动更流畅 */
  overflow-y: auto;
}
.item {
  width: 104px;
  height: 104px;
  margin: 8px;
  cursor: pointer;
  /* 必须加：让子元素缩放不超出盒子 */
  overflow: hidden;
  border-radius: 8px;
}
.item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 流畅动画 */
  transition: transform 0.3s ease;
}
/* 悬浮放大核心代码 */
.item:hover img {
  transform: scale(1.1);
}
</style>