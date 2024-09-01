import { join } from 'node:path';
import { defineConfig } from 'vite';
import commonjsExternals from 'vite-plugin-commonjs-externals';

export default defineConfig({
  plugins: [
    commonjsExternals({
      externals: [
        'node:fs',
        'node:fs/promises',
        'node:path',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@icons': join(__dirname, 'src/assets/icons'),
    },
  },
  esbuild: {
    target: 'chrome127',
    include: /\.(m?[jt]s|[jt]sx)$/,
    exclude: [],
    keepNames: true,

  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        assetFileNames(chunkInfo) {
          if (chunkInfo.name?.includes('nunito-sans'))
            return `assets/[name].[ext]`;
          return `assets/[name]-[hash].[ext]`;
        },
      },
    },
  },
});
