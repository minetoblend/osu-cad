<script setup lang="ts">
import UserAvatar from './UserAvatar.vue';
import { useCurrentUser } from '../composables/useCurrentUser.ts';
import { isMobile } from '@/util/isMobile.ts';
import { useRoute } from 'vue-router';

const mobile = isMobile();

const { user } = useCurrentUser();
const loginUrl = computed(() => {
  return `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
});

const route = useRoute();
const isVisible = computed(() => {
  if (route.fullPath.startsWith('/edit') && mobile) return false;
  return true;
});
</script>

<template>
  <nav v-show="isVisible" class="oc-navbar">
    <RouterLink class="oc-navbar-logo" to="/">
      <img src="@/assets/logo-text.svg" alt="osucad logo" height="48" />
    </RouterLink>
    <div id="navbar-start" />
    <div class="spacer" />
    <div id="navbar-end" class="q-mr-md" />
    <RouterLink v-if="user" class="oc-current-user" :to="`/users/${user.id}`">
      <UserAvatar :id="user.id" />
      {{ user.username }}
    </RouterLink>
    <a v-else :href="loginUrl"> log in with osu! </a>
  </nav>
</template>

<style lang="scss" scoped>
.oc-navbar {
  background-color: $surface-50;
  height: 64px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 1em;

  .spacer {
    flex-grow: 1;
  }
}

.oc-current-user {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

@media (max-width: 1024px) {
  .oc-navbar {
    height: 48px;
  }
}
</style>
