import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [
      nxViteTsPaths(),
      nodePolyfills(),
    ],

    esbuild: {
      target: 'chrome113',
      format: 'esm',
    },

    build: {
      // minify: process.env.NODE_ENV === 'production',
      minify: false,
      sourcemap: false,

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
