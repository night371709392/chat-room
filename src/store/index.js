import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    addFriendPage: false,
    createGroupPage: false,

    activeChatType: 'notice',
    currentFriend: null
  },
  mutations: {
    openAddFriendPage (state) {
      state.addFriendPage = true
    },
    closeAddFriendPage (state) {
      state.addFriendPage = false
    },
    openCreateGroupPage (state) {
      state.createGroupPage = true
    },
    closeCreateGroupPage (state) {
      state.createGroupPage = false
    },
    setActiveChatType (state, type) {
      state.activeChatType = type
    },
    setCurrentFriend (state, friend) {
      state.currentFriend = friend
    }
  },
  actions: {
    // 切换到好友聊天界面
    switchToFriendChat ({ commit }, friend) {
      commit('setActiveChatType', 'friend')
      commit('setCurrentFriend', friend)
    },
    // 切换到系统通知界面
    switchToNotice ({ commit }) {
      commit('setActiveChatType', 'notice')
      commit('setCurrentFriend', null)
    }
  },
  getters: {
    activeChatType: state => state.activeChatType,
    currentFriend: state => state.currentFriend
  }
})

export default store