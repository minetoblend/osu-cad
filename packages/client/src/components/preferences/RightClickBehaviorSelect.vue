<script setup lang="ts">
import { usePreferences } from '@/composables/usePreferences.ts';

defineProps<{
  withDescription?: boolean;
}>();

const { preferences } = usePreferences();

const value = toRef(preferences.behavior, 'rightClickBehavior');
</script>

<template>
  <ToggleGroup v-model="value">
    <ToggleGroupItem value="contextMenu">Context menu</ToggleGroupItem>
    <ToggleGroupItem value="delete">Delete</ToggleGroupItem>
  </ToggleGroup>
  <div v-if="withDescription" class="mt-2">
    <template v-if="value === 'contextMenu'">
      <p><span class="code">right click</span> to open the context menu.</p>
      <p><span class="code">shift+right click</span> will delete the object.</p>
    </template>
    <template v-else>
      <p><span class="code">right click</span> will delete the object.</p>
      <p>
        <span class="code">shift+right click</span> to open the context menu.
      </p>
    </template>
  </div>
</template>

<style>
.code {
  font-family: monospace;
  background-color: theme('colors.gray.300');
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
}
</style>
