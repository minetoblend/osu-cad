import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    nxViteTsPaths(),
  ],
  esbuild: {
    target: 'esnext',
    minifyIdentifiers: false,
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
    minify: true,
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
