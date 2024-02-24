import { createApp } from 'vue';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/500.css';
import '@fontsource/nunito-sans/600.css';
import './style.scss';
import App from './App.vue';
import 'primeflex/primeflex.css';
import { router } from '../router.ts';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import { Quasar, Dialog, Loading } from 'quasar';
import axios from 'axios';
import { App as CapacitorApp } from '@capacitor/app';
import { isMobile } from '@/util/isMobile.ts';
import { Capacitor } from '@capacitor/core';

axios.defaults.baseURL = import.meta.env.VITE_BASEURL as string;

if (
  isMobile() &&
  Capacitor.getPlatform() === 'web' &&
  !window.location.search.includes('redirectToApp')
) {
  // @ts-expect-error this works, typescript just thinks it doesn't
  window.location =
    'osucad://osucad.com' + window.location.pathname + '?redirectToApp';
  setTimeout(() => {
    if (!document.hidden) {
      init();
    }
  }, 500);
} else {
  init();
}

function init() {
  createApp(App)
    .use(router)
    .use(Quasar, {
      config: {
        dark: true,
      },
      plugins: {
        Dialog,
        Loading,
      },
    })
    .mount('#app');
}

CapacitorApp.addListener('appUrlOpen', (data) => {
  if (data.url) {
    const url = new URL(data.url);
    router.push(url.pathname + url.search);
  }
});
