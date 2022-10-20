<template>
  <n-card>
    <template #header>
      {{ beatmapSet.artist }} &ndash; {{ beatmapSet.title }}
    </template>
    <n-space>
      <n-button type="primary" ghost v-for="beatmap in beatmapSet.beatmaps" :key="beatmap.id"
                @click="importMapset(beatmapSet, beatmap)">
        {{ beatmap.version }} ({{ beatmap.difficulty_rating }}*)
      </n-button>
    </n-space>
    <pre v-if="false">
    {{ beatmapSet }}
    </pre>
  </n-card>
</template>

<script setup lang="ts">

import axios from "axios";
import {apiUrl} from "@/api";
import {useLoadingBar} from "naive-ui";
import {useRouter} from "vue-router";

const props = defineProps({
  beatmapSet: {type: Object, required: true}
})

const loadingBar = useLoadingBar()
const router = useRouter()

async function importMapset(beatmapSet: any, map: any) {
  loadingBar.start()
  try {
    const response = await axios.get(apiUrl('/beatmap/import/' + beatmapSet.id), {withCredentials: true})
    loadingBar.finish()
    console.log(response.data)
    if (response.data.difficulties) {
      const difficulty = response.data.difficulties.find((it: any) => it.difficultyName === map.version)
      if (difficulty) {
        router.push('/edit/' + difficulty.id)
      }
    }
  } catch (e) {
    loadingBar.error()
  }
}

</script>