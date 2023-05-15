import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'
import { PixiPlugin } from "./pixiPlugin";
import Inspect from 'vite-plugin-inspect'


export default defineConfig({
  plugins: [
    vue({
      isProduction: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("pixi-"),
        },
      },
    }),
    Components({
      resolvers: [
        BootstrapVueNextResolver(),
      ]
    }),
    PixiPlugin(),
    Inspect(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@osucad/unison": resolve(__dirname, "../unison/src"),
      "@osucad/unison-client": resolve(__dirname, "../unison-client/src"),
    },
  },
  server: {
    host: "0.0.0.0",
    origin: "https://osucad.com",
  },
});
