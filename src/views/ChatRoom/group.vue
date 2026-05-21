<template>
  <div class="group">
    <div class="list">
      <div class="header">
        <div class="ipt">
          <input type="text" placeholder="搜索">
        </div>
        <button @click="openPage"><i class="ri ri-add-line"></i></button>
      </div>

      <ContactIndexList
        :items="groupList"
        :get-name="groupDisplayName"
        item-key="group_id"
        empty-text="暂无群聊"
        @select="onSelectGroup"
      >
        <template #item="{ item }">
          <div class="head-image">
            <img :src="item.group_picture || defaultAvatar" alt="">
          </div>
          <div class="right">
            <p>{{ groupDisplayName(item) }}</p>
          </div>
        </template>
      </ContactIndexList>
    </div>
  </div>
</template>

<script>
import ContactIndexList from '@/components/ContactIndexList.vue'

export default {
  name: 'GroupPage',
  components: {
    ContactIndexList
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
    }
  },
  computed: {
    groupList () {
      return this.$store.state.userGroupList
    }
  },
  created () {},
  methods: {
    openPage () {
      this.$store.commit('openCreateGroupPage')
    },
    groupDisplayName (item) {
      if (!item) return '-'
      return String(item.group_name ?? item.name ?? '').trim() || '-'
    },
    onSelectGroup (item) {
      console.log('[group] select', item)
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
.group {
  width: 260px;
  min-height: 100vh;
  border-right: 1px solid rgba(0, 0, 0, .08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, .05);
}
.group .list {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.group .list .header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0px 12px;
  flex-shrink: 0;
}
.group .list .header .ipt {
  width: 192px;
  height: 32px;
  line-height: 32px;
}
.group .list .header .ipt input {
  width: 100%;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #fff;
}
.group .list .header .ipt input:hover {
  border-color: #2830D3;
}
.group .list .header .ipt input:focus {
  border-color: #2830D3;
}
.group .list .header button {
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
.group .list .header button:hover {
  color: #EAEAFB;
  transform: scale(1.1);
}
.group .list .header .ri {
  color: #3458DA;
  font-size: 18px;
  font-style: normal;
}
.group .list >>> .item .head-image {
  width: 45px;
  height: 45px;
}
.group .list >>> .item .head-image img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}
.group .list >>> .item .right {
  padding-left: 10px;
  text-align: left;
  flex: 1;
  font-size: 14px;
}
</style>
