<script setup lang="ts">
import { PathType, Vec2 } from "@osucad/common";
import {
  Circle,
  FederatedPointerEvent,
  Graphics,
  SCALE_MODES,
  Texture,
} from "pixi.js";
import { shallowRef } from "vue";
import circlePng from "@/assets/textures/circle.png";
import { computed } from "@vue/reactivity";

const props = defineProps<{
  position: Vec2;
  type: PathType | null;
  selected?: boolean;
  hovered?: boolean;
}>();

const emit = defineEmits<{
  (name: "pointerdown", event: FederatedPointerEvent): void;
}>();

const texture = Texture.from(circlePng, {
  scaleMode: SCALE_MODES.LINEAR,
});

const el = shallowRef<Graphics>();

const hitArea = new Circle(0, 0, 8);

const tint = computed(() => {
  let tint = 0xffee33;
  switch (props.type) {
    case PathType.Bezier:
      tint = 0xff1cff;
      break;
    case PathType.Linear:
      tint = 0xff1c3a;
      break;
    case PathType.PerfectCurve:
      tint = 0x9d03fc;
      break;
    case PathType.Catmull:
      tint = 0x2bfff8;
  }
  return tint;
});

const scale = computed(() => {
  if (props.hovered) return 1.3;
  return 1;
});
</script>

<template>
  <pixi-container
    :position="position"
    :hit-area="hitArea"
    :scale="scale"
    ref="el"
    event-mode="static"
    @pointerdown="emit('pointerdown', $event)"
  >
    <pixi-sprite
      :visible="selected"
      center
      :texture="texture"
      :scale="0.35"
      :tint="0xf5d442"
    />
    <pixi-sprite center :texture="texture" :scale="0.25" :tint="tint" />
  </pixi-container>
</template>
