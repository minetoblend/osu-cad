<script setup lang="ts">
import { EditorInstance, provideEditor } from "@/editor/createEditor";
import { ShallowRef, computed, provide, ref, useSlots } from "vue";
import { globalHitArea } from "./tools/hitArea";
import { Container, FederatedMouseEvent } from "pixi.js";
import { provideViewportState } from "./tools/composables/mouseEvents";
import CursorContainer from "./CursorContainer.vue";
import { ToolInstance } from "./tool";
import { useRafFn } from "@vueuse/core";

const props = defineProps<{
  editor: EditorInstance;
  canvas: HTMLCanvasElement;
  activeTool: ShallowRef<ToolInstance>;
}>();


const activeTool = props.activeTool;

const SELECTION_FADE_OUT_TIME = 700;

const visibleHitObjects = computed(() =>
  props.editor.hitObjects.getRange(
    props.editor.clock.currentTime - SELECTION_FADE_OUT_TIME,
    props.editor.clock.currentTime + props.editor.difficulty.timePreempt
  )
);

const el = ref<Container>();
const mousePos = ref({ x: 0, y: 0 });
const rawMousePos = ref({ x: 0, y: 0})

function onMouseMove(evt: FederatedMouseEvent) {
  rawMousePos.value = evt.getLocalPosition(el.value!);
}

useRafFn(() => mousePos.value = rawMousePos.value)

const hoveredHitObjects = computed(() => {
  const pos = mousePos.value;

  return visibleHitObjects.value.filter((o) => o.contains(pos.x, pos.y));
});

provideViewportState(mousePos, props.canvas);

provideEditor(props.editor);
provide("visibleHitObjects", visibleHitObjects);
provide("hoveredHitObjects", hoveredHitObjects);

</script>

<template>
  <pixi-container ref="el" :hit-area="globalHitArea" @pointermove="onMouseMove">
    <Component v-if="activeTool.component" :is="activeTool.component" :state="activeTool.state" />
    <CursorContainer />
  </pixi-container>
</template>

