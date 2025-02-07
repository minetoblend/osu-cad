import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    nxViteTsPaths(),
  ],
  build: {
    target: 'modules',
    rollupOptions: {

    },
  },
});
