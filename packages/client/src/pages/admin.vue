<script setup lang="ts">
import { definePage } from 'vue-router/auto';

definePage({
  meta: {
    requiresAuth: true,
    requiresAdmin: true,
  },
});
</script>

<template>
  <layout-default>
    <template #sidebar>
      <AppNavSidebarButton to="/admin/rooms" text="rooms" />
      <AppNavSidebarButton to="/admin/users" text="users" />
    </template>
  </layout-default>
</template>
