import { defineConfig, type Plugin } from 'vite';

const texturePlugin: Plugin = {
  name: 'pixi textures',
  enforce: 'pre',
  load(id) {
    if(!id.endsWith('?texture')) return null;

    const path = id.split('?')[0]

    return `
    import { Assets } from 'pixi.js'
    import url from ${JSON.stringify(path)}

    export default await Assets.load(url) 
    `
  }
}

export default defineConfig({
  plugins: [texturePlugin],
  worker: {
    format: 'es'
  },
});
