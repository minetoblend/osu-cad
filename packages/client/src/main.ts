import { createApp as _createApp, createSSRApp, App as VueApp } from 'vue';
import App from './App.vue';
import { createRouter } from './plugins/router.ts';
import { createPinia } from 'pinia';
import { sentry } from './plugins';
import VWave from 'v-wave';
import { createHead } from '@unhead/vue';

export function createApp() {
  let app: VueApp<Element>;
  if (__hydrate__ || import.meta.env.SSR) {
    app = createSSRApp(App);
  } else {
    app = _createApp(App);
  }

  const pinia = createPinia();
  const router = createRouter();
  const head = createHead();

  app.use(sentry, { router });
  app.use(router);
  app.use(pinia);
  app.use(head);

  if (!import.meta.env.SSR) {
    app.use(VWave, {});
  } else {
    app.directive('wave', {});
  }

  return { app, router, pinia, head };
}
