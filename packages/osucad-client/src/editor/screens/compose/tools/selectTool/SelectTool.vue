<template>
  <pixi-container ref="el" :hit-area="globalHitArea" @mousedown="onMouseDown">
    <SelectBox @drag="handleSelectBox" />
    <TransformBox />
    <SliderPathVisualiser v-if="activeSlider" :slider="activeSlider" />
    <pixi-container />
  </pixi-container>
</template>

<script setup lang="ts">
import { Container, FederatedMouseEvent, Rectangle } from "pixi.js";
import SelectBox from "../components/SelectBox.vue";
import { Ref, computed, inject, ref } from "vue";
import { useEditor } from "@/editor/createEditor";
import { HitObject, Slider } from "@osucad/common";
import { rectCircleIntersection } from "@/utils/rectCircleIntersect";
import TransformBox from "../TransformBox.vue";
import { globalHitArea } from "../hitArea";
import SliderPathVisualiser from "../components/SliderPathVisualiser.vue";

const visibleHitObjects = inject("visibleHitObjects") as Ref<HitObject[]>;
const { selection } = useEditor()!;
const el = ref<Container>();

const hoveredHitObjects = inject("hoveredHitObjects") as Ref<HitObject[]>;

const activeSlider = computed(() => {
  const hovered = hoveredHitObjects.value;
  if (hovered.length === 1 && hovered[0] instanceof Slider) return hovered[0];

  if (selection.value.size === 1) {
    const hitObjects = selection.selectedHitObjects[0];
    if (hitObjects instanceof Slider) return hitObjects;
  }
  return undefined;
});

function handleSelectBox(rect: Rectangle) {
  selection.select(
    ...visibleHitObjects.value.filter((p) =>
      rectCircleIntersection(rect, p.position, 28)
    )
  );
}

function onMouseDown(evt: FederatedMouseEvent) {
  const pos = evt.getLocalPosition(el.value!);
  const hoveredHitObjects = visibleHitObjects.value.filter((p) =>
    p.contains(pos.x, pos.y)
  );

  if (hoveredHitObjects.length === 0) {
    if (!evt.ctrlKey) selection.clear();
    return;
  }

  if (evt.ctrlKey) {
    if (selection.isSelected(hoveredHitObjects[0])) {
      selection.remove(hoveredHitObjects[0]);
    } else {
      selection.add(hoveredHitObjects[0]);
    }
  } else {
    if (!selection.isSelected(hoveredHitObjects[0]))
       selection.select(hoveredHitObjects[0]);
  }

  evt.preventDefault();
  evt.stopPropagation();
}
</script>
