import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

// 默认头像信息
const default_avatar = {
  id: 1,
  url: 'https://pic2.zhimg.com/v2-dcafd27e255b9df7e10c1e0992246b55_r.jpg'
}

const store = new Vuex.Store({
  state: {
    // 页面
    addFriendPage: false, // 添加好友页面
    createGroupPage: false, // 创建群聊页面
    chatSubStatus: '', // 当前聊天子页面状态（'chat'、'note'等）
    chatNotePage: false, // 聊天记录页面
    avatarPage: false, // 头像选择页面

    // 用户信息
    userEmail: '',
    userName: '',
    userGender: 0,
    userPicture: default_avatar.url, // 用户头像URL
    userPictureId: default_avatar.id, // 用户头像ID
    userSignature: '', // 用户个性签名
    userFriendList: [], // 用户好友列表

    // 选择的头像信息
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
    },
    closeAvatarPage (state) {
      state.avatarPage = false
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
    },
    setUserFriendList (state, friendList) {
      state.userFriendList = friendList
    }
  }
})

export default store