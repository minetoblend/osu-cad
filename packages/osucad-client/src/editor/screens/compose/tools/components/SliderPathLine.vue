<script setup lang="ts">
import { PathPoint, PathType, Slider } from '@osucad/common';
import { Graphics } from 'pixi.js';
import { ref, watchEffect } from 'vue';

const props = defineProps<{
  slider: Slider
}>();

const graphics = ref<Graphics>();

watchEffect(() => {
  const g = graphics.value;
  if (!g) return;

  g.clear();
  const controlPoints = props.slider.controlPoints;
  if (controlPoints.length < 2) return;

  g.moveTo(controlPoints[0].position.x, controlPoints[0].position.y);

  let currentType = controlPoints[0].type ?? PathType.Bezier;


  for (let i = 1; i < controlPoints.length; i++) {
    let color = 0xcccccc;
    switch (currentType) {
      case PathType.Bezier:
        color = 0xff3dbb;
        break;
      case PathType.Linear:
        color = 0x3dffa4;
        break;
      case PathType.PerfectCurve:
        color = 0xffad33;
        break;
      case PathType.Catmull:
        color = 0x33a4ff;
    }

    g.lineStyle(1.5, color);

    g.lineTo(controlPoints[i].position.x, controlPoints[i].position.y);

    if (controlPoints[i].type !== null) currentType = controlPoints[i].type!;
  }


  /*if (newPointPosition.value && ctrlDown.value) {
    const { position, index } = newPointPosition.value;

    g.lineStyle();
    g.beginFill(0xffffff, 0.5);
    g.drawCircle(position.x, position.y, 3);
    g.endFill();
  }*/
});

</script>

<template>
  <pixi-graphics ref="graphics" />
</template>