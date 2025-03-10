import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    nxViteTsPaths() as any,
  ],
  esbuild: {
    target: 'esnext',
    minifyIdentifiers: false,
  },
  worker: {
    format: 'es',
    plugins: () => [nxViteTsPaths() as any],
  },
  build: {
    outDir: '../../dist/packages/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
    minify: true,
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/multiplayer': {
        target: 'http://localhost:3002',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
