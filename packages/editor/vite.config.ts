import { defineConfig, type Plugin } from 'vite';
import PixiAssets from 'unplugin-pixi-assets/vite'
import * as path from 'path'


const fontsPlugin: Plugin = {
  name: 'fonts',
  enforce: 'pre',
  load(id) {
    if (id.endsWith('.fnt?bmFont')) {
      const path = id.split('?')[0]

      const texturePath = path.split('.').slice(-1) + '.png'

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
      ]
    })
  ],
  resolve: {
    alias: {
      '@icons': path.join(__dirname, 'src/assets/icons')
    }
  },
  worker: {
    format: 'es'
  },
});
