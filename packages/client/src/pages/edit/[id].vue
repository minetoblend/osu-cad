<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed} from "vue";
import BeatmapEditor from "../../editor/components/BeatmapEditor.vue";
import {useCurrentUser} from "../../composables/useCurrentUser.ts";

const route = useRoute();


const beatmapId = computed(() => (route.params as any)["id"] as string);

const {user} = useCurrentUser();
const loginUrl = computed(() => {
  return `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
});
</script>

<template>
  <Suspense>
    <BeatmapEditor :beatmap-id="beatmapId" :key="beatmapId"/>
    <template #fallback>
      <div style="padding: 2rem">
        <h3>Loading...</h3>
      </div>
    </template>
  </Suspense>
</template>