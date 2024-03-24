<script setup lang="ts">
const isMounted = useMounted();
</script>

<template>
  <slot v-if="isMounted" />
  <slot v-else name="ssr-fallback" />
</template>
