import { defineConfig, type Plugin } from 'vite';
import PixiAssets from 'unplugin-pixi-assets/vite'
import { resolve, join } from 'path'
import * as fs from 'fs/promises'
import Dts from 'vite-plugin-dts'


const fontsPlugin: Plugin = {
  name: 'fonts',
  enforce: 'pre',
 async load(id) {
    if (id.endsWith('.fnt?bmFont')) {
      const path = id.split('?')[0]

      const texturePath = (path.split('.').slice(0, -1)).join('.') + '.png'

      console.log(texturePath)

      this.emitFile({
        type: 'asset',
        name: texturePath.split('/').pop(),
        needsCodeReference: false,
        source: await fs.readFile(resolve(process.cwd(), texturePath))
      })

      return `
      import { FontDefinition } from 'osucad-framework'

      const font = new FontDefinition(
        new URL(${JSON.stringify(path)}, import.meta.url).href,
        new URL(${JSON.stringify(texturePath)}, import.meta.url).href,
      )

      await font.load()

      export default font
      `
    }
  }
}

export default defineConfig({
  plugins: [
    fontsPlugin,
    PixiAssets({
      assetsFolder: [
        {
          src: 'src/assets/icons',
          assetIds: {
            prefix: 'icon:',
            dotNotation: true,
            stripExtensions: true,
          }
        }
      ],
      textures: {
        defaultOptions: {
          autoGenerateMipmaps: true
        }
      }
    }),
    Dts(),
  ],
  resolve: {
    alias: {
      '@icons': join(__dirname, 'src/assets/icons')
    }
  },
  worker: {
    format: 'es'
  },
  build: {
    target: "esnext",
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'osucad-editor',
      formats: ['es'],
      fileName: 'index',

    },

    rollupOptions: {

      output: {
        assetFileNames(chunkInfo) {
          if(chunkInfo.name?.includes('nunito-sans'))
            return `assets/[name].[ext]`
          return  `assets/[name]-[hash].[ext]`;
        },
      }
    }
  }
});
