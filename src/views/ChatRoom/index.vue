<template>
  <div class="chatroom">
    <Nav></Nav>
    <router-view></router-view>
    <Popup></Popup>
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'
import Popup from '@/components/Popup.vue'

export default {
    name: 'ChatRoom',
    components: {
        Nav,
        Popup
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