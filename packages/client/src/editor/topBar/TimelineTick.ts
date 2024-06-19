import { Sprite, Texture } from 'pixi.js';
import { TickType } from '@osucad/common';

export class TimelineTick extends Sprite {
  constructor() {
    super({
      texture: Texture.WHITE,
      width: 4,
      anchor: { x: 0.5, y: 0.5 },
    });
  }

  set type(type: TickType) {
    switch (type) {
      case TickType.Full:
        this.tint = 0xffffff;
        this.scale.set(1.5, 0.8);
        break;
      case TickType.Half:
        this.tint = 0xff0000;
        this.scale.set(1, 0.7);
        break;
      case TickType.Third:
        this.tint = 0xff00ff;
        this.scale.set(1, 0.5);
        break;
      case TickType.Quarter:
        this.tint = 0x3687f7;
        this.scale.set(1, 0.5);
        break;
      case TickType.Sixth:
        this.tint = 0xff77ff;
        this.scale.set(1, 0.4);
        break;
      case TickType.Eighth:
        this.tint = 0xffff00;
        this.scale.set(1, 0.4);
        break;
      default:
        this.tint = 0x777777;
        this.scale.set(1, 0.4);
        break;
    }
  }
}
