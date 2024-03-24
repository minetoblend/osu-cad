<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore.ts';
import { useServerSeoMeta } from '@unhead/vue';
import logoUrl from '@/assets/logo-icon-dark.png';

definePage({
  meta: {
    layout: 'landing',
  },
});

useServerSeoMeta({
  title: 'osucad - The collaborative beatmap editor',
  ogTitle: 'osucad - The collaborative beatmap editor',
  ogDescription: 'Create and edit osu! beatmaps with your friends.',
  ogImage: logoUrl,
  ogType: 'website',
});

const router = useRouter();

const userStore = useUserStore();
watchEffect(() => {
  if (userStore.isLoggedIn) {
    router.replace('/beatmaps/recent');
  }
});

async function getStarted() {
  if (userStore.isLoggedIn) {
    router.push('/beatmaps/recent');
  } else {
    userStore.login('/beatmaps/recent');
  }
}
</script>

<template>
  <layout-landing>
    <div class="antialiased">
      <div class="p-10 md:px-20 lg:p-30 <sm:py-40">
        <div class="flex">
          <div
            class="text-6xl md:text-8xl font-bold text-primary-600 text-shadow text-shadow-primary-600 relative block"
          >
            <div
              class="landing-gradient w-50 h-30 rounded-full absolute translate-x--1/2 left-50% top-50% translate-y--1/2 filter-blur-100px"
            />
            osucad
          </div>
        </div>
        <div class="text-4xl md:text-6xl font-semibold text-gray-700 mt-4">
          The collaborative beatmap editor
        </div>
        <div class="mt-20 text-center">
          <button
            class="getting-started btn-gray-100 transition-(shadow colors)"
            text="xl hover:primary-800"
            ring="0 hover:(1 primary-600)"
            @click="getStarted"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  </layout-landing>
</template>

<style lang="postcss" scoped>
.landing-gradient {
  background: linear-gradient(90deg, #52cca3 0%, #1fb7af 100%);
}

.getting-started {
  box-shadow: 0 0 5px rgba(82, 204, 163, 0.3);
  &:hover {
    box-shadow:
      var(--un-ring-shadow),
      0 0 20px rgba(82, 204, 163, 0.4);
  }
}
</style>
