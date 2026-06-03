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
import axios from 'axios'
import ContactIndexList from '@/components/ContactIndexList.vue'

export default {
  name: 'GroupPage',
  components: {
    ContactIndexList
  },
  data () {
    return {
      defaultAvatar: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg',
      groupDetailAbortController: null,
      groupDetailRequestSeq: 0
    }
  },
  computed: {
    groupList () {
      return this.$store.state.userGroupList
    }
  },
  beforeDestroy () {
    if (this.groupDetailAbortController) {
      this.groupDetailAbortController.abort()
      this.groupDetailAbortController = null
    }
    this.$store.commit('setGroupDetailLoading', false)
  },
  methods: {
    openPage () {
      this.$store.commit('openCreateGroupPage')
    },
    groupDisplayName (item) {
      if (!item) return '-'
      return String(item.group_name ?? item.name ?? '').trim() || '-'
    },
    onSelectGroup (item) {
      if (this.$store.state.chatSubStatus !== 'groupDetail') {
        this.$store.commit('setChatSubStatus', 'groupDetail')
      }
      this.loadGroupDetail(item)
    },
    isCanceledAxiosError (err) {
      return axios.isCancel(err) || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError'
    },
    loadGroupDetail (groupItem) {
      if (this.groupDetailAbortController) {
        this.groupDetailAbortController.abort()
      }
      const controller = new AbortController()
      this.groupDetailAbortController = controller

      const groupId = Number(groupItem.group_id ?? groupItem.id)

      const fallback = {
        group_id: groupId,
        group_name: groupItem.group_name ?? groupItem.name ?? '',
        group_picture: groupItem.group_picture ?? groupItem.picture ?? ''
      }

      this.$store.commit('setGroupDetailLoading', true)
      this.$store.commit('setCurrentGroupDetail', fallback)

      const seq = ++this.groupDetailRequestSeq

      this.$axios.post('/api/group/one/main', {
        group_id: groupId
      }, {
        signal: controller.signal
      }).then(res => {
        console.log(res)
        if (seq !== this.groupDetailRequestSeq) return
        if (controller.signal.aborted) return
        const ok = res.data && (res.data.error === 'success' || res.data.err === 'success')
        if (!ok) return
        const raw = res.data.group || {}
        const detail = {
          ...fallback,
          group_name: raw.group_name ?? raw.name ?? fallback.group_name,
          group_picture: raw.group_picture ?? raw.picture ?? raw.avatar ?? fallback.group_picture,
          owner_name: raw.leader_name ?? '',
          remark: raw.group_rename ?? raw.remark ?? raw.group_re_name ?? '',
          my_nickname: raw.user_rename ?? raw.nickname ?? ''
        }
        this.$store.commit('setCurrentGroupDetail', detail)
      }).catch(err => {
        if (seq !== this.groupDetailRequestSeq) return
        if (this.isCanceledAxiosError(err)) return
        console.warn('[loadGroupDetail]', err)
      }).finally(() => {
        if (seq !== this.groupDetailRequestSeq) return
        this.$store.commit('setGroupDetailLoading', false)
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
