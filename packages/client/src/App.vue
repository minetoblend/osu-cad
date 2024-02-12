<script setup lang="ts">

import TitleBar from "./components/AppNavbar.vue";
</script>

<template>
  <div class="app">
    <TitleBar/>
    <main>
      <RouterView/>
    </main>
    <div id="dpi"/>
  </div>
</template>

<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  main {
    flex-grow: 1;
    overflow: hidden;
  }
}

#dpi {
  height: 1cm;
  left: -100%;
  position: absolute;
  top: -100%;
  width: 1cm;
}
</style>