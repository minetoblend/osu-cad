import { build, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import autoImport from 'unplugin-auto-import/vite';
import components from 'unplugin-vue-components/vite';
import router from 'unplugin-vue-router/vite';
import layouts from 'vite-plugin-vue-layouts';
import unoCSS from 'unocss/vite';
import markdown from 'unplugin-vue-markdown/vite';
import inspect from 'vite-plugin-inspect';
import * as dotenv from 'dotenv';
import MarkdownItAnchor from 'markdown-it-anchor';
import MarkdownItPrism from 'markdown-it-prism';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: resolve(__dirname, '../../.env'),
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: [
      'vue',
      '@vueuse/core',
      'variant',
      'osu-classes',
      '@ygoe/msgpack',
      'uuid',
      'socket.io-client',
      'pixi.js',
      'reflect-metadata',
      'unplugin-vue-router/runtime',
      'gsap',
      '@capacitor/core',
    ],
  },
  plugins: [
    autoImport({
      imports: [
        'vue',
        '@vueuse/core',
        {
          'vue-router/auto': ['definePage'],
          '@unhead/vue': ['useServerSeoMeta'],
        },
      ],
    }),
    markdown({
      headEnabled: true,
      wrapperClasses: 'prose w-full',
      markdownItOptions: {
        linkify: true,
        html: true,
        typographer: true,
      },
      markdownItSetup(md) {
        md.use(MarkdownItAnchor);
        md.use(MarkdownItPrism);
      },
    }),
    layouts(),
    router({
      extensions: ['.vue', '.md'],
    }),
    components({
      resolvers: [
        (name) => {
          if (name.startsWith('Layout')) {
            return resolve(
              __dirname,
              'src/layouts/' + name.slice(6).toLowerCase() + '.vue',
            ).replaceAll('\\', '/');
          }
        },
      ],
    }),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    unoCSS(),
    inspect(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Document-Policy': 'js-profiling',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/admin/queues': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/variables.scss";`,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ssr: resolve(__dirname, 'ssr.html'),
      },
    },
  },
  define: {
    __hydrate__: process.env.NODE_ENV === 'production',
  },
});
