import { Sprite, Texture } from 'pixi.js';

export interface BoxOptions {
  tint?: number;
  width?: number;
  height?: number;
  alpha?: number;
  visible?: boolean;
}

export class Box extends Sprite {
  constructor(options: BoxOptions = {}) {
    super({
      texture: Texture.WHITE,
      tint: options.tint,
      width: options.width,
      height: options.height,
      alpha: options.alpha,
      visible: options.visible,
    });
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
