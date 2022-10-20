<template>
  <EditorHost :beatmap-id="beatmapId">

  </EditorHost>
</template>

<script setup lang="ts">

import {useRoute} from "vue-router";
import EditorHost from "@/components/EditorHost.vue";

const route = useRoute()

const beatmapId = route.params.id as string

</script>