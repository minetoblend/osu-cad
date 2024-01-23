import {createApp} from "vue";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/500.css";
import "@fontsource/nunito-sans/600.css";
import "./style.scss";
import App from "./App.vue";
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-dark-green/theme.css'

import 'primeflex/primeflex.css'
import {router} from "../router.ts";

createApp(App)
  .use(router)
  .use(PrimeVue)
  .mount("#app");

