<script setup lang="ts">

import TitleBar from "./components/AppNavbar.vue";
</script>

<template>
  <div>
    <TitleBar/>
    <main>
      <RouterView/>
    </main>
  </div>
</template>