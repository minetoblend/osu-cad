/// <reference types='vitest' />
import { defineConfig } from 'vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import commonjsExternals from 'vite-plugin-commonjs-externals';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/editor',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    nxViteTsPaths(),
    commonjsExternals({
      externals: [
        'node:fs',
        'node:fs/promises',
        'node:path',
        'node:process',
      ],
    }),
  ],

  worker: {
    format: 'es',
    plugins: () => [nxViteTsPaths()],
  },

  esbuild: {
    target: 'chrome113',
  },

  build: {
    outDir: '../../dist/packages/editor',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
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
});
