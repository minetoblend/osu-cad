<script setup lang="ts">
import { ToggleGroupRoot } from 'radix-vue';

const selection = ref('first');
</script>

<template>
  <ToggleGroupRoot v-model="selection" class="flex" type="single">
    <slot />
  </ToggleGroupRoot>
</template>
