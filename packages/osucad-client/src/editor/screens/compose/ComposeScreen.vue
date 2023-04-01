<script setup lang="ts">
import {useElementSize} from "@vueuse/core";
import {onMounted, ref, shallowRef} from "vue";
import ComposeScreenToolbar from "./ComposeScreenToolbar.vue";
import {seekOnScroll} from "@/composables/seekOnScroll";
import {createViewport, Viewport} from "./viewport";

const container = ref();
const canvas = ref();

const { width: containerWidth, height: containerHeight } =
  useElementSize(container);

const viewport = shallowRef<Viewport>();

onMounted(() => {
  viewport.value = createViewport(canvas.value!);
});

seekOnScroll(container);
</script>

<template>
  <div class="compose-screen">
    <ComposeScreenToolbar v-if="viewport" class="toolbar" />
    <div class="viewport">
      <div ref="container" class="viewport-container">
        <canvas
          ref="canvas"
          :width="Math.floor(containerWidth)"
          :height="Math.floor(containerHeight)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.compose-screen {
  width: 100%;
  height: 100%;

  position: relative;

  .toolbar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 48px;
  }

  .viewport {
    background-color: black;
    position: absolute;
    inset: 0 0 0 48px;
  }
}

.viewport-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  canvas {
    position: absolute;
  }
}
</style>
