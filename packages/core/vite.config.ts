/// <reference types='vitest' />

import * as path from 'node:path';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/core',

  plugins: [
    nxViteTsPaths(),
    libAssetsPlugin({
      include: ['**/*.png', '**/*.wav', '**/*.webp'],
      name: '[name].[contenthash:8].[ext]',
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../dist/packages/core',
    emptyOutDir: true,
    target: 'esnext',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'core',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        'osucad-framework',
        '@osucad/resources',
        '@osucad/multiplayer',
        '@osucad/serialization',
        'pixi.js',
      ],
    },
  },
});
