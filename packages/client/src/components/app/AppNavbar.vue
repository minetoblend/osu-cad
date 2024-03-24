<script setup lang="ts">
import { useUserStore } from '@/stores/userStore.ts';
import { storeToRefs } from 'pinia';
import AppNavbarLink from '@/components/app/AppNavbarLink.vue';

const userStore = useUserStore();
const { user, isLoggedIn, isAdmin } = storeToRefs(userStore);

const { y: scrollY } = useWindowScroll();
const mounted = useMounted();
</script>

<template>
  <nav
    class="z-10 py-2 bg-gray-100 bg-opacity-0 border-gray-300 transition-colors transition-border relative"
    :class="[
      mounted &&
        scrollY > 0 &&
        'bg-gray-200 bg-opacity-90 border-b backdrop-blur-20',
    ]"
  >
    <div
      class="mx-auto md:max-w-1200px 2xl:max-w-1400px flex items-center px-5 h-12 m-auto gap-6"
    >
      <div class="flex h-full">
        <AppLogo />
      </div>
      <div class="flex-grow"></div>

      <AppNavbarLink v-if="isAdmin" to="/admin" text="Admin" />
      <AppNavbarLink v-if="isLoggedIn" to="/beatmaps" text="Beatmaps" />
      <AppNavbarLink v-if="isLoggedIn" to="/guide" text="Guide" />
      <div v-if="user" class="flex items-center gap-2">
        <NavbarUserDropdown />
      </div>
      <Button v-else @click="userStore.login()">Login with osu!</Button>
    </div>
    <AppNavigationIndicator />
  </nav>
</template>
