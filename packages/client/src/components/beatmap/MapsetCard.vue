<script setup lang="ts">
import {MapsetInfo} from "@osucad/common";

const props = defineProps<{
  mapset: MapsetInfo;
}>();

const coverUrl = computed(() => {
  if (props.mapset.backgroundPath) {
    return `url("/api/mapsets/${props.mapset.id}/files/${props.mapset.backgroundPath}")`;
  }
  return undefined;
});

const beatmaps = useSorted(() => props.mapset.beatmaps, (a, b) => a.starRating - b.starRating);

</script>

<template>
  <div class="oc-mapset-card">
    <div class="cover" :style="{ backgroundImage: coverUrl }"/>
    <div class="info">
      <div class="cover" :style="{ backgroundImage: coverUrl }"/>
      <div class="title">
        <RouterLink :to="`/edit/${mapset.beatmaps[0].id}`">
          {{ mapset.title }}
        </RouterLink>
      </div>
      <div class="artist">
        by {{ mapset.artist }}
      </div>
      <div class="beatmaps">
        <RouterLink v-for="beatmap in beatmaps" :key="beatmap.id" class="beatmap"
                    :to=" `/edit/${beatmap.id}`">
          {{ beatmap.name }} ({{ beatmap.starRating.toFixed(1) }}*)
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.oc-mapset-card {
  border-radius: 8px;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  cursor: pointer;
  background-color: $surface-100;

  .cover {
    width: 120px;
    height: 100%;
    background-size: cover;
    background-position: center;
    transform: scale(1.2);
    flex-shrink: 0;
  }

  .info {
    padding: 0.5rem;
    margin-left: -8px;
    background: rgba(0, 0, 0, 0.5);
    height: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    flex-shrink: 1;
    flex-grow: 1;
    position: relative;
    overflow: hidden;

    .cover {
      background-size: cover;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      filter: blur(8px) brightness(0.5);
      transform: scale(1.2);
    }

    .title {
      position: relative;
      font-size: 1.2rem;
      font-weight: 500;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .artist {
      position: relative;
      font-size: 1rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .beatmaps {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      .beatmap {
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        white-space: nowrap;
        padding: 0.1rem 0.5rem;
      }
    }
  }
}
</style>