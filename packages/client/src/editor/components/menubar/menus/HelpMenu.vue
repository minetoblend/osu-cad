<script setup lang="ts">
import EditorMenubarMenu from '@/editor/components/menubar/EditorMenubarMenu.vue';
import EditorMenubarRouteItem from '@/editor/components/menubar/EditorMenubarRouteItem.vue';
import EditorMenubarItem from '@/editor/components/menubar/EditorMenubarItem.vue';

function reportBug() {
  window.open('https://discord.gg/JYFTaYDSC6', '_blank');
}
</script>

<template>
  <EditorMenubarMenu value="help" text="Help">
    <EditorMenubarRouteItem
      to="/guide/keyboard-shortcuts"
      text="Keyboard shortcuts"
      target="_blank"
    />
    <EditorMenubarItem text="Report a bug" @click="reportBug" />
  </EditorMenubarMenu>
</template>
