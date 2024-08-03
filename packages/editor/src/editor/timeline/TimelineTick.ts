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

  #type!: TickType;

  get type() {
    return this.#type;
  }

  set type(type: TickType) {
    this.#type = type;

    switch (type) {
      case TickType.Full | TickType.Downbeat:
        this.tint = 0xFFFFFF;
        this.scale.set(1.5, 1);
        break;
      case TickType.Full:
        this.tint = 0xFFFFFF;
        this.scale.set(1.5, 0.8);
        break;
      case TickType.Half:
        this.tint = 0xFF0000;
        this.scale.set(1.5, 0.8);
        break;
      case TickType.Third:
        this.tint = 0xFF00FF;
        this.scale.set(1.25, 0.65);
        break;
      case TickType.Quarter:
        this.tint = 0x3687F7;
        this.scale.set(1.25, 0.6);
        break;
      case TickType.Sixth:
        this.tint = 0xFF77FF;
        this.scale.set(1, 0.6);
        break;
      case TickType.Eighth:
        this.tint = 0xFFFF00;
        this.scale.set(1, 0.5);
        break;
      default:
        this.tint = 0x777777;
        this.scale.set(1, 0.5);
        break;
    }
  }
}
