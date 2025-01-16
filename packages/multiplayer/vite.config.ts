/// <reference types='vitest' />
import * as path from 'node:path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/multiplayer',

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  test: {
    globals: true,
  },

  build: {
    outDir: '../../dist/packages/multiplayer',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: 'multiplayer',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@osucad/framework',
        '@osucad/core',
        '@osucad/resources',
        '@osucad/multiplayer',
      ],
    },
  },
});
