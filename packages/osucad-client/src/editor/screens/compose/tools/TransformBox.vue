<script setup lang="ts">
import { useEditor } from "@/editor/createEditor";
import { computed } from "@vue/reactivity";
import { Graphics } from "pixi.js";
import { shallowRef, watchEffect } from "vue";
import ScaleHandle from "./components/ScaleHandle.vue";

const { selection } = useEditor()!;

const graphics = shallowRef<Graphics>();

const hitObjects = computed(() => selection.selectedHitObjects);
const padding = computed(() => 34);
const cornerGap = 3;

const bounds = computed(() => { 
  if (hitObjects.value.length === 0) return undefined;
  const bounds = hitObjects.value[0].bounds.clone();
  for (let i = 1; i < hitObjects.value.length; i++) {
    bounds.enlarge(hitObjects.value[i].bounds);
  }
  bounds.pad(padding.value);
  return bounds;
});

watchEffect(() => {
  const g = graphics.value;
  if (!g) return;

  g.clear();
  if (!bounds.value) return;

  g.lineStyle(2, 0xf5d442, 1);

  const { x, y, width, height } = bounds.value;

  g.moveTo(x + cornerGap, y);
  g.lineTo(x + width - cornerGap, y);
  g.moveTo(x + width, y + cornerGap);
  g.lineTo(x + width, y + height - cornerGap);
  g.moveTo(x + width - cornerGap, y + height);
  g.lineTo(x + cornerGap, y + height);
  g.moveTo(x, y + height - cornerGap);
  g.lineTo(x, y + cornerGap);
});
</script>

<template>
  <pixi-container>
    <pixi-graphics ref="graphics" />
    <template v-if="bounds">
      <ScaleHandle :x="bounds.left" :y="bounds.top" />
      <ScaleHandle :x="bounds.right" :y="bounds.top" />
      <ScaleHandle :x="bounds.left" :y="bounds.bottom" />
      <ScaleHandle :x="bounds.right" :y="bounds.bottom" />
    </template>
  </pixi-container>
</template>
