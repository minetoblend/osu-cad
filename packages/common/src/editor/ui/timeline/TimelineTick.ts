import { Sprite, Texture } from 'pixi.js';

export class TimelineTick extends Sprite {
  constructor() {
    super({
      texture: Texture.WHITE,
      width: 4,
    });
  }
}
