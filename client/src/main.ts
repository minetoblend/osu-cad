import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import naive from 'naive-ui'
import gsap from 'gsap'

import {OsuCadWasm} from "@/wasm";

import './index.scss'
import 'vfonts/OpenSans.css'

import PixiPlugin from 'gsap/PixiPlugin'

gsap.registerPlugin(PixiPlugin)

async function init() {

    await OsuCadWasm.init()

    createApp(App)
        .use(router)
        .use(naive)
        .mount('#app')
}

init()