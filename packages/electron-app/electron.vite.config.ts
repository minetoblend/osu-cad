import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    worker: {
      plugins: [externalizeDepsPlugin()],
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [
      nxViteTsPaths(),
      nodePolyfills(),
    ],

    worker: {
      format: 'es',
      plugins: [
        nxViteTsPaths(),
      ]
    },

    esbuild: {
      target: 'chrome113',
      format: 'esm',
    },

    build: {
      // minify: process.env.NODE_ENV === 'production',
      minify: false,
      sourcemap: false,
      target: 'chrome113',
      rollupOptions: {
        output: {
          assetFileNames(chunkInfo) {
            if (chunkInfo.name?.includes('nunito-sans'))
              return `assets/[name].[ext]`;
            return `assets/[name]-[hash].[ext]`;
          },
        },
      }
    },

    server: {
      headers: {
        'Document-Policy': 'js-profiling',
      }
    }
  },
});
