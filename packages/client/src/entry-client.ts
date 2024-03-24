import { createApp } from '@/main.ts';
import './styles.ts';

start();

declare const initialState: any;
async function start() {
  const { app, router, pinia } = createApp();

  if (__hydrate__) {
    pinia.state.value = initialState.pinia;
  }

  await router.isReady();

  app.mount('#app');
}
