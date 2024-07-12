/// <reference types="vite/client" />

declare module '*.fnt' {
  const src: string;
  export default src;
}

declare module '*?texture' {
  const texture: import('pixi.js').Texture;
  export default texture;
}

declare module '*?bmFont' {
  const font: import('osucad-framework').FontDefinition;
  export default font;
}
