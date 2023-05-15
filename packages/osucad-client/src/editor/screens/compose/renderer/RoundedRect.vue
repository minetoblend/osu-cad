<script setup lang="ts">
import { Graphics } from "pixi.js";
import { ref, watchEffect } from "vue";

const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;

    fill?: number;
    stroke?: number;
    strokeWidth?: number;
  }>(),
  {
    strokeWidth: 1,
    radius: 1,
  }
);

const el = ref<Graphics>();

watchEffect(() => {
  const g = el.value;
  if (!g) return;

  if (props.fill !== undefined) g.beginFill(props.fill);

  g.clear();
  if (props.stroke !== undefined) g.lineStyle(props.strokeWidth, props.stroke);

  g.drawRoundedRect(props.x, props.y, props.width, props.height, props.radius);

  if (props.fill !== undefined) g.endFill();
});
</script>

<template>
  <pixi-graphics ref="el" />
</template>
