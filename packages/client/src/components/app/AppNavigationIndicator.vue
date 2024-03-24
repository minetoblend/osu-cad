<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const isNavigating = ref(false);

router.beforeEach(() => {
  isNavigating.value = true;
});

router.afterEach(() => {
  isNavigating.value = false;
});
</script>

<template>
  <div class="absolute left-0 right-0 bottom-1px">
    <div
      v-if="isNavigating"
      class="navigation-indicator h-1px bg-primary-600"
    />
  </div>
</template>

<style>
.navigation-indicator {
  animation: navigation-indicator 20s;
}

@keyframes navigation-indicator {
  0% {
    width: 0;
  }
  10% {
    width: 50%;
  }
  100% {
    width: 100%;
  }
}
</style>
