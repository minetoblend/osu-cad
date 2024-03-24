<script setup lang="ts">
import EditorMenubarMenu from '@/editor/components/menubar/EditorMenubarMenu.vue';
import EditorMenubarItem from '@/editor/components/menubar/EditorMenubarItem.vue';
import { useRouter } from 'vue-router';
import { useEditor } from '@/editor/editorContext.ts';
import { usePreferencesVisible } from '@/composables/usePreferencesVisible.ts';

const router = useRouter();

const { beatmapManager } = useEditor();

function exit() {
  router.push('/');
}

function exportOsz() {
  window.open(`/api/mapsets/${beatmapManager.beatmap.setId}/export`, '_blank');
}

const preferencesVisible = usePreferencesVisible();

function showPreferences() {
  preferencesVisible.value = true;
}
</script>

<template>
  <EditorMenubarMenu value="file" text="File">
    <EditorMenubarItem text="Exit" @click="exit" />
    <EditorMenubarItem text="Export as .osz" @click="exportOsz" />
    <EditorMenubarItem
      text="Preferences"
      @click="showPreferences"
      shortcut="Ctrl+O"
    />
  </EditorMenubarMenu>
</template>
