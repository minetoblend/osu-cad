import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    nxViteTsPaths(),
  ],
  esbuild: {
    target: 'chrome113',
  },
  worker: {
    format: 'es',
    plugins: () => [nxViteTsPaths()],
  },
  build: {
    outDir: '../../dist/packages/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
  },
});
