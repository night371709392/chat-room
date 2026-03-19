<template>
  <div class="chatroom">
    <Nav></Nav>
    <router-view></router-view>
    <AddFriend v-show="$store.state.addFriendPage"></AddFriend>
    <CreateGroup v-show="$store.state.createGroupPage"></CreateGroup>
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'
import AddFriend from '@/components/AddFriend.vue'
import CreateGroup from '@/components/CreateGroup.vue'

export default {
    name: 'ChatRoom',
    components: {
        Nav,
        AddFriend,
        CreateGroup
    }
}
</script>

<style>
* {
    margin: 0;
    padding: 0;
}
.chatroom {
    display: flex;
    min-height: 100vh;
}
</style>