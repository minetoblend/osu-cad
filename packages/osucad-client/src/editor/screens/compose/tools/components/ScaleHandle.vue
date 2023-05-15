<template>
  <pixi-graphics
    :hit-area="hitArea"
    ref="el"
    @mouseenter="mouseoverCount++"
    @mouseleave="mouseoverCount--"
    :scale="mouseoverCount > 0 ? 1.3 : 1"
  />
</template>

<script setup lang="ts">
import { Circle, Graphics } from "pixi.js";
import { onMounted, ref } from "vue";

const el = ref<Graphics>();
const hitArea = new Circle(0, 0, 6);
const mouseoverCount = ref(0);

onMounted(() => {
  const g = el.value!;
  g.lineStyle(1.5, 0xf5d442);
  g.drawRoundedRect(-3, -3, 6, 6, 1);
});
</script>
