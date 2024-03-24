<script setup lang="ts">
import RightClickSelectBehavior from '@/components/preferences/RightClickBehaviorSelect.vue';
import ShortcutsTable from '@/components/preferences/ShortcutsTable.vue';
import { usePreferences } from '@/composables/usePreferences.ts';

const { preferences } = usePreferences();
</script>

<template>
  <div class="prose w-full">
    <h2>Keyboard shortcuts</h2>
    <ShortcutsTable />
    <h2>Right-click</h2>
    <p>
      Right-click is configurable in osucad, you can choose what happens when
      you right-click on an object.
    </p>
    <RightClickSelectBehavior with-description />
  </div>
</template>
