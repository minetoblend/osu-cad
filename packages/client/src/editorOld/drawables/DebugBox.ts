import { Graphics } from 'pixi.js';
import { Vec2 } from '@osucad/common';

export interface DebugBoxOptions {
  tint?: number;
  alpha?: number;
  width?: number;
  height?: number;
}

export class DebugBox extends Graphics {
  private _size: Vec2;

  get size() {
    return this._size;
  }

  set size(value: Vec2) {
    this._size = value;
    this.update();
  }

  constructor(options: DebugBoxOptions = {}) {
    super();
    const { tint = 0xff0000, alpha = 1, width = 0, height = 0 } = options;

    this.tint = tint;
    this.alpha = alpha;
    this._size = new Vec2(width, height);

    this.update();
  }

  private update() {
    this.clear();
    this.drawRect(0, 0, this._size.x, this._size.y);
    this.stroke({
      color: 0xffffff,
      width: 1,
    });
  }
}
