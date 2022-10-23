<template>
  <template v-if="initialized">
    <BeatmapEditor/>
  </template>
</template>

<script setup lang="ts">

import {EditorContext} from "@/editor";
import {onBeforeUnmount, provide, ref} from "vue";
import {useLoadingBar} from "naive-ui";
import BeatmapEditor from "@/editor/components/BeatmapEditor.vue";
import {useRoute} from "vue-router";
import {EditorConnector} from "@/editor/connector";
import axios from "axios";
import {apiUrl} from "@/api";

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

loadingBar.start()

async function init() {
  const response = await axios.get(apiUrl('/user/me '), {withCredentials: true})

  context.connect(props.beatmapId, response.data.token).then(() => {
    initialized.value = true
    loadingBar.finish()
  })
}

init()



onBeforeUnmount(() => context.destroy())

</script>