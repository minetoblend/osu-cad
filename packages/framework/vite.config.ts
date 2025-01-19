import path from 'node:path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
/// <reference types='vitest' />

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/framework',

  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],

  build: {
    outDir: '../../dist/packages/framework',
    emptyOutDir: true,
    minify: false,
    reportCompressedSize: false,
    target: 'esnext',
    lib: {
      entry: 'src/index.ts',
      name: 'framework',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        'pixi.js',
      ],
    },
  },

  esbuild: {
    target: 'chrome113',
  },

  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/framework',
      provider: 'v8',
    },
  },
});
