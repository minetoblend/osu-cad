<script setup lang="ts">
import EditorMenubarMenu from '@/editorOld/components/menubar/EditorMenubarMenu.vue';
import EditorMenubarItem from '@/editorOld/components/menubar/EditorMenubarItem.vue';
import { useEditor } from '@/editorOld/editorContext.ts';
const { commandManager } = useEditor();
</script>

<template>
  <EditorMenubarMenu value="edit" text="Edit">
    <EditorMenubarItem
      text="Undo"
      shortcut="Ctrl+Z"
      :disabled="!commandManager.history.canUndo"
      @click="commandManager.undo()"
    />
    <EditorMenubarItem
      text="Redo"
      shortcut="Ctrl+Y"
      :disabled="!commandManager.history.canRedo"
      @click="commandManager.redo()"
    />
  </EditorMenubarMenu>
</template>
