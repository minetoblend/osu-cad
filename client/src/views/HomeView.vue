<template>

  <n-grid :cols="2" :x-gap="12">
    <n-grid-item>
      <h1>
        Your beatmaps
      </h1>

      <n-space vertical>
        <n-card v-for="beatmapSet in ownMaps" :key="beatmapSet.id">
          <template #header>
            {{ beatmapSet.artist }} &ndash; {{ beatmapSet.title }}
          </template>
          <n-space>
            <n-button type="primary" ghost v-for="beatmap in beatmapSet.difficulties" :key="beatmap.id"
                      @click="$router.push('/edit/' + beatmap.id)">
              {{ beatmap.difficultyName }}
            </n-button>
          </n-space>
        </n-card>
      </n-space>
    </n-grid-item>
    <n-grid-item>
      <h1>
        Import beatmap from profile
      </h1>

      <n-space vertical>
        <BeatmapCard v-for="beatmapSet in beatmapSets" :key="beatmapSet.id" :beatmap-set="beatmapSet"/>
      </n-space>
    </n-grid-item>
  </n-grid>

</template>

<script setup lang="ts">

import {ref} from "vue";
import axios from "axios";
import {apiUrl} from "@/api";
import BeatmapCard from "@/components/BeatmapCard.vue";

const ownMaps = ref<any[]>()
const beatmapSets = ref<any[]>()

async function load() {
  const result = await axios.get(apiUrl('/osu/me/beatmaps'), {withCredentials: true})
  beatmapSets.value = result.data
}

async function loadOwnMaps() {
  const result = await axios.get(apiUrl('/beatmap/own'), {withCredentials: true})
  ownMaps.value = result.data
}

load()
loadOwnMaps()

</script>
