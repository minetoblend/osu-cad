import {createApp} from "vue";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/500.css";
import "@fontsource/nunito-sans/600.css";
import "./style.scss";
import App from "./App.vue";
import {router} from "../router.ts";

createApp(App)
  .use(router)
  .mount("#app");

