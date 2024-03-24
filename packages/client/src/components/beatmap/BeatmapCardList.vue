<script setup lang="ts">
import { BeatmapInfo } from '@osucad/common';

const props = defineProps<{
  beatmaps: BeatmapInfo[];
  isLoading?: boolean;
}>();

function onDelete(beatmap: BeatmapInfo) {
  const index = props.beatmaps.findIndex((b) => b.id === beatmap.id);
  if (index !== -1) {
    props.beatmaps.splice(index, 1);
  }
}
</script>

<template>
  <div class="row g-3">
    <template v-if="isLoading">
      <div class="col-12 lg:col-6" v-for="i in 10" :key="i">
        <BeatmapCardSkeleton />
      </div>
    </template>
    <template v-else>
      <div
        class="col-12 lg:col-6"
        v-for="(beatmap, index) in beatmaps"
        :key="beatmap.id"
      >
        <BeatmapCard
          :beatmap="beatmap"
          :eager="index < 20"
          @delete="onDelete"
        />
      </div>
    </template>
    <div v-if="beatmaps.length === 0 && !isLoading" class="col">
      <div class="p-8">
        <p class="text-center text-gray-700 text-xl">No beatmaps found</p>
      </div>
    </div>
  </div>
</template>
