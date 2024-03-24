<script setup lang="ts">
import { ToggleGroupItem as Item } from 'radix-vue';

defineProps<{
  value: string;
}>();
</script>

<template>
  <Item
    :value="value"
    class="bg-gray-200 px-4 py-2 data-[active=true]-(bg-gray-300 text-primary-600) transition-colors first:rounded-l last:rounded-r"
  >
    <slot />
  </Item>
</template>
