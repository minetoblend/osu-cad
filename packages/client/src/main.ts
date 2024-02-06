import {createApp} from "vue";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/500.css";
import "@fontsource/nunito-sans/600.css";
import "./style.scss";
import App from "./App.vue";
import 'primeflex/primeflex.css'
import {router} from "../router.ts";
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import {Quasar} from 'quasar'


createApp(App)
    .use(router)
    .use(Quasar, {
      config: {
        dark: true,
      }
    })
    .mount("#app");

