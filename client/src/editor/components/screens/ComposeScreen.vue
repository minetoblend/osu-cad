<template>
  <div class="editor-screen compose-screen">
    <HitobjectTimeline/>
    <EditorViewport class="viewport"/>
  </div>
</template>

<script setup lang="ts">

import EditorViewport from "@/editor/viewport/EditorViewport.vue";
import HitobjectTimeline from "@/editor/components/HitobjectTimeline.vue";</script>

<style lang="scss">
.compose-screen {
  display: flex;
  flex-direction: column;

  > * {
    width: 100%
  }

  .viewport {
    flex-grow: 1;
  }
}
</style>