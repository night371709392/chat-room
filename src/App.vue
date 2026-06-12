<template>
  <router-view></router-view>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.35);
  border-radius: 4px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.6);
}

::-webkit-scrollbar-thumb:active {
  background: rgba(40, 48, 211, 0.45);
}

::-webkit-scrollbar-corner {
  background: transparent;
}
</style>