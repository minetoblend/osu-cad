<script setup lang="ts">
import {
  MenubarContent,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from 'radix-vue';

defineProps<{
  value: string;
  text?: string;
}>();
</script>

<template>
  <MenubarMenu :value="value">
    <MenubarTrigger
      class="flex px-3 rounded bg-transparent hover:bg-gray-300 items-center"
    >
      <slot name="trigger">
        {{ text }}
      </slot>
    </MenubarTrigger>
    <MenubarPortal>
      <MenubarContent
        class="bg-gray-200 rounded overflow-hidden shadow-lg min-w-45 b b-gray-300"
      >
        <slot />
      </MenubarContent>
    </MenubarPortal>
  </MenubarMenu>
</template>
