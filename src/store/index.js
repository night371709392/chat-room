import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    addFriendPage: false,
    createGroupPage: false,
    chatSubStatus: '',
    chatNotePage: false,
    avatarPage: false,
    userEmail: '',
    userName: '',
    userGender: 0,
    userPicture: '',
    userPictureId: null,
    userSignature: '',
    selectedAvatarId: null,
    selectedAvatarUrl: ''
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
    },
    openAvatarPage (state) {
      state.avatarPage = true
      console.log('打开头像选择页面')
    },
    closeAvatarPage (state) {
      state.avatarPage = false
      console.log('关闭头像选择页面')
    },
    setSelectedAvatar (state, { id, url }) {
      state.selectedAvatarId = id
      state.selectedAvatarUrl = url
    },
    setUserInfo (state, { name, gender, picture, pictureId, signature, email }) {
      if (name !== undefined) state.userName = name
      if (gender !== undefined) state.userGender = gender
      if (picture !== undefined) state.userPicture = picture
      if (pictureId !== undefined) state.userPictureId = pictureId
      if (signature !== undefined) state.userSignature = signature
      if (email !== undefined) state.userEmail = email
    }
  }
})

export default store