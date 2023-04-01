import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import '@fontsource/saira/index.css'
import {router} from "./config/router";

const app = createApp(App)
app.use(VueVirtualScroller)
app.use(router).mount("#app");

