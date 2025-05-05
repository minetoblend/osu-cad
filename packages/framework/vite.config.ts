/// <reference types='vitest' />
import * as path from 'path';
import { defineConfig } from 'vite';
import ConditionalCompile from "vite-plugin-conditional-compiler";
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/framework',
  plugins: [
    dts({ entryRoot: 'src', tsconfigPath: path.join(__dirname, 'tsconfig.lib.json') }),
    ConditionalCompile()
  ],
  worker: {
    format: 'es',
  },
  esbuild: {
    target: 'chrome136',
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
    },
    lib: {
      entry: 'src/index.ts',
      name: '@osucad/framework',
      fileName: (format, entryName) =>
          `${entryName.replace(/node_modules\//g, 'external/')}.js`,
      formats: ['es' as const],
    },
    minify: false,
    target: 'modules',
    rollupOptions: {
      output: {
      },
      // External packages that should not be bundled into your library.
      external: ['pixi.js', 'pixi-filters'],
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    }
  },
}));
