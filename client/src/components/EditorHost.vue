<template>
  <template v-if="initialized">
    <BeatmapEditor/>
  </template>
</template>

<script setup lang="ts">

import {EditorContext} from "@/editor";
import {useConnector} from "@/editor/connector";
import {provide, ref} from "vue";
import {useLoadingBar} from "naive-ui";
import BeatmapEditor from "@/editor/components/BeatmapEditor.vue";
import {useRoute} from "vue-router";

const props = defineProps({
  beatmapId: {
    type: String,
    required: true
  }
})

const loadingBar = useLoadingBar()
const initialized = ref(false)

const context = new EditorContext(
    useConnector(),
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

context.connect().then(() => {
  initialized.value = true
  loadingBar.finish()
})

</script>