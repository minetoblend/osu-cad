<script setup lang="ts">
import {clamp} from "@vueuse/core";

const props = withDefaults(defineProps<{
  progress: number;
  min?: number;
  max?: number;
}>(), {
  min: 0,
  max: 100,
});

const width = computed(() => {
  const progress = clamp((props.progress - props.min) / (props.max - props.min), 0, 1);
  return `${progress * 100}%`;
});

</script>

<template>
  <div class="oc-progress-bar">
    <div class="oc-progress-bar" :style="{ width }"/>
  </div>
</template>

<style lang="scss" scoped>
.oc-progress-bar {
  width: 100%;
  background-color: rgba($text-color, 0.35);
  border-radius: 0.25rem;
  overflow: hidden;

  & > div {
    height: 4px;
    background-color: $primary;
    transition: width 0.2s ease-out;
  }
}
</style>