<template>
  <div class="chatroom">
    <Nav></Nav>
    <router-view></router-view>
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'
export default {
    name: 'ChatRoom',
    components: {
        Nav
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