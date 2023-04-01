<template>
  <Suspense>
    <BeatmapEditor :id="id" :key="id" />
    <template #fallback>
      <h1>Connecting to server...</h1>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import BeatmapEditor from "../editor/BeatmapEditor.vue";
import {computed} from "@vue/reactivity";

const route = useRoute();

const id = computed(() => route.params.id as string);
</script>
