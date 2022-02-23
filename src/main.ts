import {createApp} from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import {setupUserStore} from "@/user";

setupUserStore(router)

createApp(App)
    .use(router)
    .mount('#app')

