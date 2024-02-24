<script setup lang="ts">
import { useEditor } from '@/editor/editorContext.ts';
import { BeatmapAccess, BeatmapInfo, UserInfo } from '@osucad/common';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { promiseTimeout } from '@vueuse/core';
import ShareDialog from '@/editor/components/ShareDialog.vue';

const editor = useEditor();

const canManageShareSettings = computed(() => {
  const user = editor.connectedUsers.ownUser.value;

  return user && user.access >= BeatmapAccess.MapsetOwner;
});

const $q = useQuasar();

async function showShareDialog() {
  const beatmapId = editor?.beatmapManager.beatmap.id;
  if (!beatmapId) return;

  $q.loading.show();

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
      promiseTimeout(200),
    ]);

    $q.dialog({
      component: ShareDialog,
      componentProps: response.data,
    });
  } finally {
    $q.loading.hide();
  }
}
</script>

<template>
  <Button v-if="canManageShareSettings" @click="showShareDialog">
    <q-icon name="share" />
    Share
  </Button>
</template>
