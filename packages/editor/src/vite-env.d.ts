/// <reference types="vite/client" />

declare module '*.fnt' {
  const src: string;
  export default src;
}

declare module '*?texture' {
  const texture: import('pixi.js').Texture;
  export default texture;
}
