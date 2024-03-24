<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/userStore.ts';

definePage({
  meta: {
    layout: false,
  },
});

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <layout-default>
    <template #sidebar>
      <template v-if="isLoggedIn">
        <AppNavSidebarButton
          to="/beatmaps/import"
          text="Import beatmap"
          icon="i-fas-file-import"
        />
        <AppNavSidebarButton
          to="/beatmaps/my-beatmaps"
          text="My Beatmaps"
          icon="i-fas-folder-open"
        />
        <AppNavSidebarButton
          to="/beatmaps/recent"
          text="Recent"
          icon="i-fas-clock-rotate-left"
        />
        <AppNavSidebarButton
          to="/beatmaps/shared-with-me"
          text="Shared with me"
          icon="i-fas-user-group"
        />
      </template>
    </template>
    <RouterView />
  </layout-default>
</template>
