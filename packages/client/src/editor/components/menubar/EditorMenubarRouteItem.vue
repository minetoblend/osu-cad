<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router/auto';
import EditorMenubarItem from '@/editor/components/menubar/EditorMenubarItem.vue';

defineProps<{
  text?: string;
  disabled?: boolean;
  to: RouteLocationRaw;
  target?: string;
}>();
</script>

<template>
  <RouterLink :to="to" :target="target">
    <EditorMenubarItem :disabled="disabled">
      <slot>{{ text }}</slot>
    </EditorMenubarItem>
  </RouterLink>
</template>
