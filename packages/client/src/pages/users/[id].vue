<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const userId = computed(() => (route.params as any)['id'] as string);
</script>

<template>
  <h1>User: {{ userId }}</h1>
</template>
