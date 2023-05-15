<script setup lang="ts">
import { useEditor } from "@/editor/createEditor";
import { Circle, Vec2 } from "@osucad/common";
import { createSnapManager } from "../snapping";
import { computedWithControl } from "@vueuse/core";
import { useViewport } from "../../tools/composables/mouseEvents";
import { onUnmounted, toRef, watch } from "vue";

const { mousePos } = useViewport()!;
const { container, clock, hitObjects } = useEditor()!;

let previewCircle: Circle = new Circle(container.runtime);
previewCircle.isGhost = true;

const snapManager = createSnapManager({
  excludeHitObjects: () => [previewCircle],
});

const snappedMousePos = computedWithControl(mousePos, () => {
  const offset = snapManager.snap([mousePos.value]);

  return offset ? Vec2.add(mousePos.value, offset) : mousePos.value;
});

watch(
  toRef(clock, "currentTimeAnimated"),
  (time) => (previewCircle.startTime = time),
  { immediate: true }
);

watch(snappedMousePos, (pos) => (previewCircle.position = pos), {
  immediate: true,
});

hitObjects.insert(previewCircle);

onUnmounted(() => hitObjects.remove(previewCircle));
</script>

<template>
  <pixi-container />
</template>
