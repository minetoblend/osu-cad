import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // @ts-expect-error this works
    nxViteTsPaths(),
  ],
  esbuild: {
    target: 'chrome113',
  },
  worker: {
    format: 'es',
    // @ts-expect-error this works
    plugins: () => [nxViteTsPaths()],
  },
  build: {
    outDir: '../../dist/packages/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
  },
  server: {
    proxy: {
      '/api': {
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
});
