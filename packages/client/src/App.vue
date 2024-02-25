<script setup lang="ts">
import TitleBar from './components/AppNavbar.vue';
import { useCurrentUser } from '@/composables/useCurrentUser.ts';

const { isLoading: userIsLoading } = useCurrentUser();
</script>

<template>
  <q-layout v-if="!userIsLoading" view="hHh lpR fFf">
    <TitleBar />
    <RouterView />
    <div id="dpi" />
  </q-layout>
</template>

<style lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  //main {
  //  flex-grow: 1;
  //  overflow-y: auto;
  //}
}

#dpi {
  height: 1cm;
  left: -100%;
  position: absolute;
  top: -100%;
  width: 1cm;
}
</style>
