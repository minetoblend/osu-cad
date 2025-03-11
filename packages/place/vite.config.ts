import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import { privatePropertyOptimizer } from './plugin';

export default defineConfig({
  plugins: [
    // @ts-expect-error this works
    nxViteTsPaths(),
    privatePropertyOptimizer(),
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
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
    minify: false,
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
      '/preview': {
        target: 'https://catboy.best',
        changeOrigin: true,
      },
      '/beatmaps': {
        target: 'https://assets.ppy.sh',
        changeOrigin: true,
      },
    },
  },
});
