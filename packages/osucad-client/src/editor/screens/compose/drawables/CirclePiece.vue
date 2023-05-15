<script setup lang=ts>
import { Vec2 } from '@osucad/common';

defineProps<{
  tint?: number
}>()

</script>

<template>
  <pixi-container>
    <pixi-sprite :tint="tint" texture="@/assets/skin/hitcircle@2x.png" center />
    <pixi-sprite texture="@/assets/skin/hitcircleoverlay@2x.png" center />
  </pixi-container>
</template>