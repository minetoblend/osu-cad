<script setup lang="ts">

import {createEditor, EditorContext} from "@/editor";
import {onMounted, ref} from "vue";
import BeatmapEditor from "@/editor/components/BeatmapEditor.vue";

import "@fontsource/saira";

const initialized = ref(false)

let editor: EditorContext

onMounted(async () => {
  editor = await createEditor()
  initialized.value = true
})

</script>

<template>
  <suspense>
    <div v-if="initialized">
      <BeatmapEditor/>
    </div>
  </suspense>
</template>

<style>

#app {
  user-select: none;
  font-family: "Saira", sans-serif;

}

.box {
  position: absolute;
  width: 100px;
  height: 100px;
  background: red;
}
</style>
