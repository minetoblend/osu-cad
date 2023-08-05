<script setup lang="ts">
import { onKeyDown, onKeyStroke, useElementSize } from "@vueuse/core";
import { onMounted, ref, shallowRef } from "vue";
import ComposeScreenToolbar from "./ComposeScreenToolbar.vue";
import { seekOnScroll } from "@/composables/seekOnScroll";
import { createViewport, Viewport } from "./viewport";
import { CommandManager } from "@/editor/commands/commandManager";
import { useEditor } from "@/editor/createEditor";
import CommandOverlay from "./CommandOverlay.vue";
import { createPixiApp } from "./renderer";
import PixiViewport from "./PixiViewport.vue";
import { ToolInstance, createTool } from "./tool";
import { SelectTool } from "./tool/selectTool";
import {CircleTool} from "@/editor/screens/compose/tool/circleTool";
import {SliderTool} from "@/editor/screens/compose/tool/sliderTool";

const container = ref();
const canvas = ref();

const { width: containerWidth, height: containerHeight } =
  useElementSize(container);

const viewport = shallowRef<Viewport>();
const commandManager = shallowRef<CommandManager>();
const editor = useEditor()!;
const activeTool = shallowRef<ToolInstance>(createTool(SelectTool));

onMounted(() => {
  viewport.value = createViewport(canvas.value!);

  commandManager.value = new CommandManager(
    editor,
    canvas.value,
    viewport.value.mousePos
  );

  const viewportApp = createPixiApp(PixiViewport, {
    editor,
    canvas: canvas.value,
    activeTool: activeTool,
  });

  viewportApp.mount(viewport.value.stage);
});

onKeyDown('1', () => activeTool.value = createTool(SelectTool))
onKeyDown('2', () => activeTool.value = createTool(CircleTool))
onKeyDown('3', () => activeTool.value = createTool(SliderTool))

seekOnScroll(container);
</script>

<template>
  <div class="compose-screen">
    <ComposeScreenToolbar class="toolbar" v-model:active-tool="activeTool" />
    <div class="viewport">
      <div ref="container" class="viewport-container">
        <canvas
          ref="canvas"
          :width="Math.floor(containerWidth)"
          :height="Math.floor(containerHeight)"
          @contextmenu.prevent
        />
      </div>
      <CommandOverlay
        v-if="commandManager?.currentCommand.value"
        :command="commandManager?.currentCommand.value"
      />
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
