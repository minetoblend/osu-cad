import { join } from 'node:path';
import { defineConfig } from 'vite';
import PixiAssets from 'unplugin-pixi-assets/vite';

export default defineConfig({
  plugins: [
    PixiAssets({
      assetsFolder: [
        {
          src: 'src/assets/icons',
          assetIds: {
            prefix: 'icon:',
            dotNotation: true,
            stripExtensions: true,
          },
        },
      ],
      textures: {
        defaultOptions: {
          autoGenerateMipmaps: true,
        },
      },
    }),
  ],
  base: '/edit/',
  resolve: {
    alias: {
      '@icons': join(__dirname, 'src/assets/icons'),
    },
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
