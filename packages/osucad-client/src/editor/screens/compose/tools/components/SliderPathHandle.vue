<script setup lang="ts">
import { PathPoint, PathType, Vec2 } from "@osucad/common";
import { useElementHover } from "@vueuse/core";
import { ALPHA_MODES, Circle, Graphics, SCALE_MODES, Texture } from "pixi.js";
import { ref, shallowRef, watchEffect } from "vue";
import circlePng from "@/assets/textures/circle.png";
import { computed } from "@vue/reactivity";

const props = defineProps<{
  position: Vec2;
  type: PathType | null;
  selected?: boolean;
}>();

const texture = Texture.from(circlePng, {
  scaleMode: SCALE_MODES.LINEAR
});

const el = shallowRef<Graphics>();

const hitArea = new Circle(0, 0, 6);

const hovering = useElementHover(el);

const tint = computed(() => {
  let tint = 0xcccccc;
  switch (props.type) {
    case PathType.Bezier:
      tint = 0xff3dbb;
      break;
    case PathType.Linear:
      tint = 0x3dffa4;
      break;
    case PathType.PerfectCurve:
      tint = 0xffad33;
      break;
    case PathType.Catmull:
      tint = 0x33a4ff;
  }
  return tint;
});

const scale = computed(() => {
  let scale = props.type ? 0.25 : 0.2;

  if (hovering.value) scale *= 1.3;

  return scale;
});
</script>

<template>
  <pixi-container
    :position="position"
    :hit-area="hitArea"
    ref="el"
    event-mode="static"
  >
    <pixi-sprite
      v-if="selected"
      center
      :texture="texture"
      :scale="scale + 0.125"
      :tint="0xf5d442"
    >
    </pixi-sprite>
    <pixi-sprite center :texture="texture" :scale="scale" :tint="tint" />
  </pixi-container>
</template>
