import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import vueRouter from 'unplugin-vue-router/vite';
import autoImport from 'unplugin-auto-import/vite';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import components from 'unplugin-vue-components/vite';
import { QuasarResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    autoImport({
      imports: ['vue', '@vueuse/core']
    }),
    vueRouter({
      importMode: 'sync'
    }),
    components({
      resolvers: [QuasarResolver()]
    }),
    vue({
      isProduction: true,
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/quasar-variables.scss',
      devTreeshaking: true
    }),
    {
      name: 'insert-environment-vars',
      transformIndexHtml(html, ctx) {
        let preconnect = '';
        if (process.env.S3_ENDPOINT_URL)
          preconnect += `<link rel="preconnect" href="${process.env.S3_ENDPOINT_URL}" />`;
        return html.replace('<!-- preconnect -->', preconnect);
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/admin/queues': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/variables.scss";`
      }
    }
  }
});
