<script setup lang="ts">
import { clamp } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    value?: number;
    min?: number;
    max?: number;
    animate?: boolean;
  }>(),
  {
    min: 0,
    max: 100,
  },
);

const progress = computed(() => {
  return clamp(
    ((props.value ?? 0) - props.min) / (props.max - props.min),
    0,
    1,
  );
});

const barStyle = computed(() => {
  return {
    width: `${progress.value * 100}%`,
  };
});
</script>

<template>
  <div class="relative w-full h-4px">
    <div class="absolute left--1px right--1px top--1px bottom--1px filter-blur">
      <div
        class="glow h-full rounded-full"
        :style="barStyle"
        :class="{ full: progress >= 1, 'transition-all': animate }"
      />
    </div>
    <div class="w-full h-4px bg-gray-300 rounded-full">
      <div
        class="h-full bg-primary-600 rounded-full"
        :style="barStyle"
        :class="{ 'transition-all': animate }"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.glow {
  background-image: linear-gradient(to right, transparent, #52cca3);
  background-position-x: right;
  background-size: 200px auto;
  background-repeat: no-repeat;

  &.full {
    background-image: none;
  }
}
</style>
