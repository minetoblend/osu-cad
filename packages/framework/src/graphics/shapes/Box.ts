import type { DrawableOptions } from '../drawables/Drawable';
import { Texture } from 'pixi.js';
import { DrawableSprite } from '../drawables/DrawableSprite';

export class Box extends DrawableSprite {
  constructor(options: DrawableOptions = {}) {
    super({ texture: Texture.WHITE });

    this.with(options);
  }
}
