<template>
  <template v-if="initialized">
    <BeatmapEditor/>
  </template>
  <div class="editor-loading-screen" v-else>
    <div>
      <LoadingIcon :progress="loadingProgress"/>
      <n-progress status="success" :percentage="loadingPercentage" :height="12" type="line" :show-indicator="false"/>
    </div>
  </div>
</template>

<script setup lang="ts">

import {EditorContext} from "@/editor";
import {computed, onBeforeUnmount, provide, ref} from "vue";
import {useLoadingBar, useMessage} from "naive-ui";
import BeatmapEditor from "@/editor/components/BeatmapEditor.vue";
import {useRoute} from "vue-router";
import {EditorConnector} from "@/editor/connector";
import axios from "axios";
import {apiUrl} from "@/api";
import LoadingIcon from "@/components/LoadingIcon.vue";
import gsap, {Power1} from 'gsap'

const props = defineProps({
  beatmapId: {
    type: String,
    required: true
  }
})

const loadingBar = useLoadingBar()
const initialized = ref(false)

const connector = new EditorConnector()

const context = new EditorContext(
    connector,
    props.beatmapId
)

const route = useRoute()

if (route.query.t) {
  const time = parseInt(route.query.t as string)
  if (!isNaN(time)) {
    context.clock.seek(time)
  }
}

provide('editorContext', context)


const loadingProgress = ref(0)

const loadingPercentage = computed(() => Math.round(Math.min(loadingProgress.value / 0.8, 1) * 100))

const message = useMessage()

async function init() {
  const response = await axios.get(apiUrl('/user/me '), {withCredentials: true})

  context.loadWithProgress(props.beatmapId, response.data.token).subscribe({
    next: progress => {
      gsap.to(loadingProgress, {value: progress, duration: 1})
    },
    complete: () => {
      gsap.to(loadingProgress, {value: 2, duration: 1.4, ease: Power1.easeOut})

      setTimeout(() => {
        initialized.value = true
      }, 1400)
    },
    error: (err) => {
      console.log(err)
    }
  })
}

init()


onBeforeUnmount(() => context.destroy())

</script>

<style>
.editor-loading-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>