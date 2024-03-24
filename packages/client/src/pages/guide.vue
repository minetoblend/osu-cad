<script setup lang="ts">
definePage({
  meta: {
    layout: false,
  },
});
</script>

<template>
  <layout-default>
    <template #sidebar>
      <AppNavSidebarButton to="/guide/overview" text="Overview" />
      <AppNavSidebarButton
        to="/guide/keyboard-shortcuts"
        text="Keyboard shortcuts"
      />
    </template>
    <RouterView />
  </layout-default>
</template>
