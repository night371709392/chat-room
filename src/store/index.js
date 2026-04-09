import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    addFriendPage: false,
    createGroupPage: false,
    chatSubStatus: 'notice',
    chatNotePage: false
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
    setChatSubStatus (state, status) {
      state.chatSubStatus = status
    },
    openChatNotePage (state) {
      state.chatNotePage = true
    },
    closeChatNotePage (state) {
      state.chatNotePage = false
    }
  }
})

export default store