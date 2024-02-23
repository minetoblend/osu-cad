<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import BeatmapEditor from '../../editor/components/BeatmapEditor.vue';
import { useCurrentUser } from '../../composables/useCurrentUser.ts';
import Button from '../../components/Button.vue';

const route = useRoute();

const beatmapId = computed(() => (route.params as any)['id'] as string);

const { user } = useCurrentUser();
const loginUrl = computed(() => {
  return `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
});
</script>

<template>
  <BeatmapEditor v-if="user" :beatmap-id="beatmapId" :key="beatmapId" />
  <div v-else style="padding: 5rem; text-align: center">
    <p>You need to be logged in to edit beatmaps.</p>
    <p>
      <a :href="loginUrl">
        <Button>Login with osu</Button>
      </a>
    </p>
  </div>
</template>
