import * as path from 'node:path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/ruleset-mania',

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../dist/packages/ruleset-mania',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: false,
    target: 'esnext',
    lib: {
      entry: 'src/index.ts',
      name: 'ruleset-mania',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@osucad/framework',
        '@osucad/core',
        '@osucad/resources',
      ],
    },
  },
});
