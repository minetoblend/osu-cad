import type { Matrix } from 'pixi.js';
import { Rectangle } from './Rectangle';
import { Vec2 } from './Vec2';

export class Quad {
  constructor(
    readonly topLeft: Vec2,
    readonly topRight: Vec2,
    readonly bottomLeft: Vec2,
    readonly bottomRight: Vec2,
  ) {}

  static fromRectangle(rect: Rectangle): Quad {
    return new Quad(
      new Vec2(rect.left, rect.top),
      new Vec2(rect.right, rect.top),
      new Vec2(rect.left, rect.bottom),
      new Vec2(rect.right, rect.bottom),
    );
  }

  transform(matrix: Matrix) {
    return new Quad(
      matrix.apply(this.topLeft, new Vec2()),
      matrix.apply(this.topRight, new Vec2()),
      matrix.apply(this.bottomLeft, new Vec2()),
      matrix.apply(this.bottomRight, new Vec2()),
    );
  }

  get AABB() {
    const minX = Math.min(this.topLeft.x, this.topRight.x, this.bottomLeft.x, this.bottomRight.x);
    const minY = Math.min(this.topLeft.y, this.topRight.y, this.bottomLeft.y, this.bottomRight.y);
    const maxX = Math.max(this.topLeft.x, this.topRight.x, this.bottomLeft.x, this.bottomRight.x);
    const maxY = Math.max(this.topLeft.y, this.topRight.y, this.bottomLeft.y, this.bottomRight.y);
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }
}
