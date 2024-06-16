<script setup lang="ts">
import EditorMenubarMenu from '@/editorOld/components/menubar/EditorMenubarMenu.vue';
import EditorMenubarRouteItem from '@/editorOld/components/menubar/EditorMenubarRouteItem.vue';
import EditorMenubarItem from '@/editorOld/components/menubar/EditorMenubarItem.vue';

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
