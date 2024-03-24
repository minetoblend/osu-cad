<script setup lang="ts">
const underscoreCounter = useInterval(500);
const underscoreShowing = computed(() => underscoreCounter.value % 2 === 0);
</script>

<template>
  <layout-default>
    <div class="h-50vh flex items-center justify-center">
      <div class="text-2xl font-mono">
        <span class="text-primary-600">404</span> Not found<span
          :class="[!underscoreShowing && 'opacity-0']"
          >_</span
        >
      </div>
    </div>
  </layout-default>
</template>
