<script setup lang="ts">
import { PathType, Slider } from "@osucad/common";
import { Graphics } from "pixi.js";
import { shallowRef, watchEffect } from "vue";

const props = defineProps<{
  slider: Slider;
}>();

const graphics = shallowRef<Graphics>();

watchEffect(() => {
  const g = graphics.value;
  if (!g) return;

  g.clear();
  const controlPoints = props.slider.controlPoints.controlPoints;
  if (controlPoints.length < 2) return;

  g.moveTo(controlPoints[0].position.x, controlPoints[0].position.y);

  let currentType = controlPoints[0].type ?? PathType.Bezier;

  for (let i = 1; i < controlPoints.length; i++) {
    let tint = 0xffee33;
    switch (currentType) {
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

    g.lineStyle(1.5, tint);

    g.lineTo(controlPoints[i].position.x, controlPoints[i].position.y);

    if (controlPoints[i].type !== null) currentType = controlPoints[i].type!;
  }
});
</script>

<template>
  <pixi-graphics ref="graphics" />
</template>
