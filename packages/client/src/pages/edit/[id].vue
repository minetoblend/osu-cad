<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import BeatmapEditor from '@/editor/components/BeatmapEditor.vue';
import { useCurrentUser } from '@/composables/useCurrentUser.ts';
import Button from '@/components/Button.vue';
import axios from 'axios';
import { BeatmapAccess } from '@osucad/common';

const route = useRoute();

const joinKey = computed(() => (route.params as any)['id'] as string);

const { state: accessLevel, isLoading } = useAsyncState(async () => {
  const response = await axios.get<{ access: BeatmapAccess }>(
    `/api/beatmaps/access`,
    {
      params: {
        shareKey: joinKey.value,
      },
    },
  );
  return response.data.access;
}, BeatmapAccess.None);

const { user, isLoading: isUserLoading } = useCurrentUser();
const loginUrl = computed(() => {
  return `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
});
</script>

<template>
  <q-page-container>
    <q-page>
      <template v-if="!(isLoading || isUserLoading)">
        <BeatmapEditor
          v-if="accessLevel > BeatmapAccess.None"
          :join-key="joinKey"
          :key="joinKey"
        />
        <div v-else style="padding: 5rem; text-align: center">
          <template v-if="user">
            <p>You don't have permission to view this beatmap.</p>
          </template>
          <template v-else>
            <p>You need to be logged in to edit beatmaps.</p>
            <p>
              <a :href="loginUrl">
                <Button>Login with osu</Button>
              </a>
            </p>
          </template>
        </div>
      </template>
    </q-page>
  </q-page-container>
</template>

<style lang="scss" scoped>
p {
  font-size: 1.1rem;
  color: #fff;
}
</style>
