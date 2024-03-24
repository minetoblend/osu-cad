<script setup lang="ts">
import { useEditor } from '@/editor/editorContext.ts';
import { BeatmapAccess, BeatmapInfo, UserInfo } from '@osucad/common';
import axios from 'axios';
import { promiseTimeout } from '@vueuse/core';
import ShareDialog from '@/editor/components/shareDialog/ShareDialog.vue';
import { DialogRoot, DialogPortal, DialogOverlay } from 'radix-vue';

const editor = useEditor();

const canManageShareSettings = computed(() => {
  const user = editor.connectedUsers.ownUser.value;

  return user && user.access >= BeatmapAccess.MapsetOwner;
});

const showDialog = ref(false);
const shareInfo = ref();

async function showShareDialog() {
  const beatmapId = editor?.beatmapManager.beatmap.id;
  if (!beatmapId) return;

  try {
    // If the request finishes really quickly the loading animation looks weird,
    // so we add a small delay to make it look better
    const [response] = await Promise.all([
      axios.get<{
        beatmap: BeatmapInfo;
        access: BeatmapAccess;
        participants: {
          user: UserInfo;
          access: BeatmapAccess;
        }[];
      }>(`/api/beatmaps/${beatmapId}/access/settings`),
    ]);

    shareInfo.value = response.data;
    showDialog.value = true;
  } finally {
  }
}
</script>

<template>
  <button
    v-if="canManageShareSettings"
    class="btn-primary-600 py-1"
    v-wave
    @click="showShareDialog"
  >
    Share
  </button>
  <DialogRoot v-model:open="showDialog">
    <DialogPortal>
      <DialogOverlay class="bg-black inset-0 opacity-50 fixed inset-0 z-30" />
      <ShareDialog v-if="showDialog" v-model="showDialog" v-bind="shareInfo" />
    </DialogPortal>
  </DialogRoot>
</template>
