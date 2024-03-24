<script setup lang="ts">
import { useUserStore } from '@/stores/userStore.ts';
import logoUrl from '@/assets/logo-icon-dark.png';
import { useServerSeoMeta } from '@unhead/vue';

const userStore = useUserStore();

if (!userStore.loaded) userStore.loadUser();

useServerSeoMeta({
  title: 'osucad: online osu beatmap editor',
  ogTitle: 'osucad: online osu beatmap editor',
  ogType: 'website',
  ogUrl: import.meta.env.VITE_BASEURL,
  ogImage: import.meta.env.VITE_BASEURL + logoUrl,
});
</script>

<template>
  <div v-if="userStore.loaded">
    <RouterView />
  </div>
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
