import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {resolve} from "path";
import vueRouter from "unplugin-vue-router/vite";
import autoImport from "unplugin-auto-import/vite";
import {quasar, transformAssetUrls} from '@quasar/vite-plugin'
import components from "unplugin-vue-components/vite";
import {QuasarResolver} from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  root: 'packages/client',
  plugins: [
    autoImport({
      imports: ["vue", "@vueuse/core"],
    }),
    vueRouter({
      importMode: 'sync',
    }),
    components({
      resolvers: [QuasarResolver()],
    }),
    vue({
      isProduction: true,
      template: {transformAssetUrls}
    }),
    quasar({
      sassVariables: 'src/quasar-variables.scss',
      devTreeshaking: true
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },

  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/variables.scss";`,
      },
    },
  },
});
