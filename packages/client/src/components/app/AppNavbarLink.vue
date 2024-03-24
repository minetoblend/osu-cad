<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router/auto';

defineProps<{
  to: RouteLocationRaw;
  text: string;
}>();
</script>

<template>
  <RouterLink
    :to="to"
    class="text-gray-700 hover:text-white <md:hidden"
    active-class="text-primary-600"
  >
    {{ text }}
  </RouterLink>
</template>
