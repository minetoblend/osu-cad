<script setup lang="ts">

import UserAvatar from "./UserAvatar.vue";
import {useCurrentUser} from "../composables/useCurrentUser.ts";

const { user } = useCurrentUser();
const loginUrl = computed(() => {
  return `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
});

</script>

<template>
  <nav class="oc-navbar">
    <RouterLink class="oc-navbar-logo" to="/">
      <img src="@/assets/logo-text.svg" alt="osuad logo" height="48">
    </RouterLink>
    <div id="navbar-content">

    </div>
    <div class="spacer"></div>
    <RouterLink class="oc-current-user" v-if="user" :to="`/users/${user.id}`">
      <UserAvatar :id="user.id"/>
      {{ user.username }}
    </RouterLink>
    <a v-else :href="loginUrl">
      log in with osu!
    </a>
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
    flex-grow: 1
  }
}

.oc-current-user {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

</style>