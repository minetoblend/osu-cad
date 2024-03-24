<script setup lang="ts">
import { useLoader } from '@/composables/useLoader.ts';
import BeatmapCardList from '@/components/beatmap/BeatmapCardList.vue';
import { getRecentBeatmaps } from '@/api';
import { definePage } from 'vue-router/auto';

definePage({
  meta: {
    requiresAuth: true,
    authRedirect: '/',
  },
});

const searchTerm = ref('');
const debouncedSearchTerm = debouncedRef(searchTerm, 250);

const { data: beatmaps, isLoading } = useLoader(
  'beatmaps',
  () =>
    getRecentBeatmaps({
      filter: 'shared-with-me',
      sort: 'recent',
      search: debouncedSearchTerm.value,
    }),
  [],
  [debouncedSearchTerm],
);

const isDebouncing = computed(
  () => debouncedSearchTerm.value !== searchTerm.value,
);
</script>

<template>
  <TextInput
    v-model="searchTerm"
    type="search"
    class="mb-4"
    placeholder="Search"
  />
  <BeatmapCardList
    :beatmaps="beatmaps"
    :is-loading="isLoading || isDebouncing"
  />
  <div
    v-if="!isLoading && searchTerm === '' && beatmaps.length === 0"
    class="flex items-center justify-center"
  >
    <RouterLink to="/beatmaps/import" class="btn-primary-600"
      >Import beatmap</RouterLink
    >
  </div>
</template>
