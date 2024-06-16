<script setup lang="ts">
const target = ref();
const targetIsVisible = ref(false);

const height = ref(0);

useIntersectionObserver(
  target,
  ([{ isIntersecting, boundingClientRect }]) => {
    targetIsVisible.value = isIntersecting;
    height.value = boundingClientRect.height;
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="target"
    :style="height > 0 && !targetIsVisible && { height: `${height}px` }"
  >
    <slot v-if="height === 0 || targetIsVisible" />
  </div>
</template>
