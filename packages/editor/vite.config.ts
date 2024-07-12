import { defineConfig, type Plugin } from 'vite';
import * as path from 'path'

const texturePlugin: Plugin = {
  name: 'pixi textures',
  enforce: 'pre',
  load(id) {
    if(id.endsWith('?texture')) {
      const path = id.split('?')[0]

      return `
      import { Assets } from 'pixi.js'
      import url from ${JSON.stringify(path)}
  
      export default await Assets.load(url) 
      `
    } else if (id.endsWith('.fnt?bmFont')) {
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
  plugins: [texturePlugin],
  resolve: {
    alias: {
      '@icons': path.join(__dirname, 'src/assets/icons')
    }
  },
  worker: {
    format: 'es'
  },
});
