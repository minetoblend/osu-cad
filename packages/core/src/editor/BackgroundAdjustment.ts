import { Vec2 } from '@osucad/framework';

export class BackgroundAdjustment {
  position = new Vec2();

  get x() {
    return this.position.x;
  }

  set x(value: number) {
    this.position.x = value;
  }

  get y() {
    return this.position.y;
  }

  set y(value: number) {
    this.position.y = value;
  }

  #size = new Vec2(1, 1);

  get size(): Vec2 {
    return this.#size;
  }

  set size(value: Vec2 | number) {
    if (value instanceof Vec2)
      this.#size = value;
    else
      this.#size = new Vec2(value, value);
  }

  get width() {
    return this.size.x;
  }

  set width(value: number) {
    this.size.x = value;
  }

  get height() {
    return this.size.y;
  }

  set height(value: number) {
    this.size.y = value;
  }

  #scale = new Vec2(1, 1);

  get scale(): Vec2 {
    return this.#scale;
  }

  set scale(value: Vec2 | number) {
    if (value instanceof Vec2)
      this.#scale = value;
    else
      this.#scale = new Vec2(value, value);
  }

  get scaleX() {
    return this.scale.x;
  }

  set scaleX(value: number) {
    this.scale.x = value;
  }

  get scaleY() {
    return this.scale.y;
  }

  set scaleY(value: number) {
    this.scale.y = value;
  }

  alpha = 0.75;

  moveDuration = 500;

  resizeDuration = 500;

  scaleDuration = 500;

  fadeDuration = 500;
}
