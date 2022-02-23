import {createApp} from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import {setupUserStore} from "@/user";

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


setupUserStore(router)


library.add(faPlay, faPause)

createApp(App)
    .component('icon', FontAwesomeIcon)
    .use(router)
    .mount('#app')

