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
      <AppNavSidebarButton to="/admin/rooms" text="Rooms" />
      <AppNavSidebarButton to="/admin/users" text="Users" />
      <AppNavSidebarButton to="/admin/audit-log" text="Audit log" />
    </template>
  </layout-default>
</template>
