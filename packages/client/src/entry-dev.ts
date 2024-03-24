import { createApp } from 'vue';
import App from '@/App.vue';
import { createRouter } from '@/plugins/router.ts';
import { createPinia } from 'pinia';
import { useUserStore } from '@/stores/userStore.ts';

import 'virtual:uno.css';
import '@unocss/reset/tailwind-compat.css';

start();

async function start() {
  const app = createApp(App);

  const router = createRouter();
  const pinia = createPinia();

  app.use(router);
  app.use(pinia);

  router.beforeEach(() => {});

  await useUserStore().loadUser();

  await router.isReady();

  app.mount('#app');
}
