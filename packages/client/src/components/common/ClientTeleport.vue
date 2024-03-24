<script setup lang="ts">
defineProps<{
  to: string;
}>();
</script>

<template>
  <ClientOnly>
    <Teleport :to="to">
      <slot />
    </Teleport>
  </ClientOnly>
</template>
