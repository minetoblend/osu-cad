import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from "vite-plugin-dts";
import * as path from 'node:path';

export default defineConfig({
  plugins: [
    nxViteTsPaths(),
    libAssetsPlugin({
      include: ['**/*.png', '**/*.wav', '**/*.webp'],
      name: '[name].[contenthash:8].[ext]',
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: '../../dist/packages/resources',
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: './src/index.ts',
      name: 'osucad-resources',
      formats: ['es']
    },
    rollupOptions: {
      external: ['osucad-framework', 'pixi.js'],
    }
  }
})
