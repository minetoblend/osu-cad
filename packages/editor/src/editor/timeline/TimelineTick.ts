import { Color, Sprite, Texture } from 'pixi.js';
import { TickType } from '@osucad/common';

const tickColors = {
  [TickType.Full]: new Color(0xFFFFFF),
  [TickType.Half]: new Color(0xFF0000),
  [TickType.Third]: new Color(0xFF00FF),
  [TickType.Quarter]: new Color(0x3687F7),
  [TickType.Sixth]: new Color(0xFF77FF),
  [TickType.Eighth]: new Color(0xFFFF00),
  [TickType.Other]: new Color(0x777777),
} as const

export class TimelineTick extends Sprite {
  constructor() {
    super({
      texture: Texture.WHITE,
      width: 4,
      anchor: { x: 0.5, y: 1 },
      y: 1,
    });
  }

  #type!: TickType;

  get type() {
    return this.#type;
  }

  set type(type: TickType) {
    this.#type = type;

    const color = tickColors[type as keyof typeof tickColors] ?? tickColors[TickType.Other];

    this.tint = color;

    switch (type) {
      case TickType.Full | TickType.Downbeat:
        this.scale.set(1.5, 1);
        break;
      case TickType.Full:
        this.scale.set(1.5, 0.75);
        break;
      case TickType.Half:
        this.scale.set(1.5, 0.75);
        break;
      case TickType.Third:
        this.scale.set(1.25, 0.5);
        break;
      case TickType.Quarter:
        this.scale.set(1.25, 0.5);
        break;
      case TickType.Sixth:
        this.scale.set(1, 0.4);
        break;
      case TickType.Eighth:
        this.scale.set(1, 0.35);
        break;
      default:
        this.scale.set(1, 0.3);
        break;
    }
  }
}
