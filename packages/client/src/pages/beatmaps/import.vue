<script setup lang="ts">
import Button from '@/components/Button.vue';
import Dropzone from '@/components/Dropzone.vue';
import axios from 'axios';
import {
  BeatmapAccess,
  BeatmapImportProgress,
  BeatmapInfo,
  MapsetInfo,
} from '@osucad/common';

type UploadStatus =
  | BeatmapImportProgress
  | {
      status: 'uploading';
      progress: number;
    };

const status = ref<UploadStatus>();

const onDrop = async (files: File[]) => {
  if (files.length === 0) return;
  status.value = {
    status: 'uploading',
    progress: 0,
  };

  const formData = new FormData();
  formData.append('file', files[0]);

  const response = await axios.post<{ job: string }>(
    '/api/beatmaps/import',
    formData,
    {
      withCredentials: true,
      onUploadProgress(progressEvent) {
        if (progressEvent.progress && progressEvent.total) {
          status.value = {
            status: 'uploading',
            progress: Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            ),
          };
        }
      },
    },
  );

  const job = response.data.job;

  const eventSource = new EventSource(`/api/beatmaps/import/events/${job}`, {
    withCredentials: true,
  });

  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data) as BeatmapImportProgress;
    status.value = data;
    if (data.status === 'done') {
      const response = await axios.get('/api/mapsets/' + data.mapsetId, {
        withCredentials: true,
      });

      mapset.value = response.data;
    }
  };

  eventSource.onerror = (event) => {
    console.error(event);
  };
};

const mapset = ref<MapsetInfo>();

const beatmaps = computed(() => {
  if (!mapset.value) return [];
  return mapset.value.beatmaps.map<BeatmapInfo>((beatmap) => {
    return {
      id: beatmap.id,
      version: beatmap.name,
      access: BeatmapAccess.MapsetOwner,
      artist: mapset.value!.artist,
      title: mapset.value!.title,
      isOwner: true,
      lastEdited: '',
      creator: mapset.value!.creator,
      links: {
        edit: beatmap.links.edit,
        thumbnail: beatmap.links.thumbnailSmall,
        view: beatmap.links.self,
      },
    };
  });
});
</script>

<template>
  <div class="m-auto max-w-3xl">
    <div v-if="mapset" class="flex flex-col gap-3">
      <BeatmapCard
        v-for="beatmap in beatmaps"
        :key="beatmap.id"
        :beatmap="beatmap"
      />
    </div>
    <Dropzone v-else v-slot:default="{ select }" accept=".osz" @drop="onDrop">
      <div class="h-40 flex items-center justify-center px-20">
        <div class="w-full flex flex-col gap-4 items-start">
          <div
            class="w-full flex items-center justify-center gap-2"
            v-if="!status"
          >
            Drag .osz file here or
            <button class="btn-primary-600 ml-2" @click="select">
              Select file
            </button>
          </div>
          <template v-else-if="status.status === 'uploading'">
            <ProgressBar animate :value="status.progress" />
            <div class="truncate">Uploading</div>
          </template>
          <template v-else-if="status.status === 'initializing'">
            <ProgressBar :value="100" />
            <div class="truncate">Initializing import</div>
          </template>
          <template v-else-if="status.status === 'analyzing-archive'">
            <ProgressBar :value="100" />
            <div class="truncate">Analyzing archive</div>
          </template>
          <template v-else-if="status.status === 'importing-beatmaps'">
            <ProgressBar :value="100" />
            <div class="truncate">
              Importing beatmaps[{{ status.finished }}/{{ status.total }}]:
              {{ status.current }}
            </div>
          </template>
          <template v-else-if="status.status === 'importing-assets'">
            <ProgressBar :value="100" />
            <div class="truncate">
              Importing files[{{ status.finished }}/{{ status.total }}]:
              {{ status.current }}
            </div>
          </template>
          <template v-else-if="status.status === 'generating-thumbnails'">
            <ProgressBar :value="100" />
            <div class="truncate">
              Generating thumbnails[{{ status.finished }}/{{ status.total }}]:
              {{ status.current }}
            </div>
          </template>
        </div>
      </div>
    </Dropzone>
  </div>
</template>
