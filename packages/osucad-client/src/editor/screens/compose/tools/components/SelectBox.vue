<template>
  <pixi-graphics
    ref="el"
    :hit-area="hitArea"
    @mousedown="onMouseDown"
    @globalmousemove="onPointerMove"
  />
</template>

<script setup lang="ts">
import { FederatedPointerEvent, Graphics, IHitArea, Rectangle } from "pixi.js";
import { Vec2 } from "@osucad/common";
import { ref, watchEffect } from "vue";
import { computed } from "@vue/reactivity";
import { globalHitArea } from "../hitArea";
import { useEventListener } from "@vueuse/core";

const emit = defineEmits<{
  (evt: "start"): void;
  (evt: "drag", rect: Rectangle): void;
  (evt: "drag-end", rect: Rectangle): void;
}>();

const hitArea = globalHitArea;

const el = ref<Graphics>();
const dragStart = ref<Vec2>();
const dragEnd = ref<Vec2>();
const rect = computed(() => {
  if (!dragStart.value || !dragEnd.value) return;
  return new Rectangle(
    Math.min(dragStart.value.x, dragEnd.value.x),
    Math.min(dragStart.value.y, dragEnd.value.y),
    Math.abs(dragStart.value.x - dragEnd.value.x),
    Math.abs(dragStart.value.y - dragEnd.value.y)
  );
});

let startPos: Vec2;

const onMouseDown = (evt: FederatedPointerEvent) => {
  const pos = evt.getLocalPosition(el.value!);
  startPos = pos;
  dragStart.value = { x: pos.x, y: pos.y };
  emit("start");
};

const onPointerMove = (evt: FederatedPointerEvent) => {
  if (!dragStart.value) return;

  const pos = evt.getLocalPosition(el.value!);

  dragEnd.value = { x: pos.x, y: pos.y };
  if (rect.value) emit("drag", rect.value);
};

useEventListener("pointerup", (evt) => {
  if (evt.button !== 0) return;
  if (rect.value) emit("drag-end", rect.value);
  dragStart.value = undefined;
  dragEnd.value = undefined;
});

watchEffect(() => {
  const g = el.value!;
  if (!g) return;

  g.clear();

  if (rect.value) {
    const r = rect.value;
    g.lineStyle(1.5, 0xffffff, 0.6);
    g.beginFill(0xffffff, 0.1);
    g.drawRoundedRect(r.x, r.y, r.width, r.height, 2);
    g.endFill();
  }
});
</script>
