<script setup lang="ts">
import EditorMenubarMenu from '@/editorOld/components/menubar/EditorMenubarMenu.vue';
import EditorMenubarItem from '@/editorOld/components/menubar/EditorMenubarItem.vue';
import { useRouter } from 'vue-router';
import { useEditor } from '@/editorOld/editorContext.ts';
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
