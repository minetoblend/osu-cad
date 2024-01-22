import {defineConfig} from "vite";
import Vue from "@vitejs/plugin-vue";
import {resolve} from "path";
import VueRouter from "unplugin-vue-router/vite";
import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vue", "@vueuse/core"],
    }),
    VueRouter({}),
    Vue({
      isProduction: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },

  },
  server: {
    origin: "http://localhost:5173",
    hmr: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/variables.scss";`,
      },
    },
  },
  build: {
    minify: false
  }
});
