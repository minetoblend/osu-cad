import { createApp } from "vue";
import "./style.scss";
import App from "./DesktopApp.vue";

import PrimeVue from 'primevue/config';


createApp(App)
    .use(PrimeVue)
    .mount("#app");
