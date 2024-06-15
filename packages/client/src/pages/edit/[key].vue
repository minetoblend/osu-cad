<script setup lang="ts">
import { useLoader } from '@/composables/useLoader.ts';
import { useAxios } from '@/composables/useAxios.ts';
import { useServerSeoMeta } from '@unhead/vue';
import { BeatmapAccess, BeatmapInfo } from '@osucad/common';
import { definePage } from 'vue-router/auto';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const EditorLoader = defineAsyncComponent(
  () => import('@/editorOld/components/EditorLoader.vue'),
);

definePage({
  meta: {
    layout: 'editor',
  },
});

const route = useRoute('/edit/[key]');
const key = computed(() => route.params.key);
const title = ref('osucad');

const userStore = useUserStore();

const { data, isLoading } = useLoader('access', async () => {
  const response = await useAxios().get<{
    access: BeatmapAccess;
    beatmap: BeatmapInfo;
  }>(`/api/beatmaps/access`, {
    params: {
      shareKey: key.value,
    },
    withCredentials: true,
  });

  const { beatmap } = response.data;

  if (beatmap) {
    title.value = `${beatmap.artist} - ${beatmap.title} [${beatmap.version}]`;
  }

  return response.data;
});

useServerSeoMeta({
  title,
  ogTitle: title,
  ogType: 'website',
  ogUrl: () => `https://dev.osucad.com/edit/${key.value}`,
  ogDescription: 'Edit your beatmap on osucad!',
  ogSiteName: 'osucad',
  ogLocale: 'en_US',
  ogImage: () => data.value?.beatmap.links.thumbnail,
});

useRouter().beforeEach((to) => {
  // forcing a location change when leaving the editor to ensure the editor is destroyed properly
  window.location.href = to.fullPath;
});

if (!import.meta.env.SSR) {
  whenever(
    () => userStore.loaded,
    () => {
      if (!userStore.isLoggedIn) {
        userStore.login();
      }
    },
    { immediate: true, once: true },
  );
}
</script>

<template>
  <layout-editor v-if="!isLoading && data">
    <ClientOnly v-if="userStore.isLoggedIn">
      <EditorLoader :join-key="key" :key="key" />
    </ClientOnly>
  </layout-editor>
</template>
