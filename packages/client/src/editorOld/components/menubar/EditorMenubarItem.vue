<script setup lang="ts">
import { MenubarItem } from 'radix-vue';

defineProps<{
  text?: string;
  disabled?: boolean;
  shortcut?: string;
}>();
</script>

<template>
  <MenubarItem
    class="flex py-1.5 px-3 hover:bg-gray-300 select-none data-[disabled]:text-gray-500 hover:data-[disabled]:bg-transparent hover-outline-none"
    :disabled="disabled"
  >
    <div class="flex-1">
      <slot>{{ text }}</slot>
    </div>
    <div v-if="shortcut || $slots.shortcut" class="ml-2 text-gray-600 text-sm">
      <slot name="shortcut">{{ shortcut }}</slot>
    </div>
  </MenubarItem>
</template>
