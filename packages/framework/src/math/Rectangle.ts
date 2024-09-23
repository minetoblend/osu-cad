import { type IVec2, Vec2 } from './Vec2';

export class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get size() {
    return new Vec2(this.width, this.height);
  }

  get center(): Vec2 {
    return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
  }

  get left(): number {
    return this.x;
  }

  get right(): number {
    return this.x + this.width;
  }

  get top(): number {
    return this.y;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  get topLeft(): Vec2 {
    return new Vec2(this.left, this.top);
  }

  get topRight(): Vec2 {
    return new Vec2(this.right, this.top);
  }

  get bottomLeft(): Vec2 {
    return new Vec2(this.left, this.bottom);
  }

  get bottomRight(): Vec2 {
    return new Vec2(this.right, this.bottom);
  }

  contains(point: IVec2) {
    return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom;
  }

  equals(rect: Rectangle) {
    return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
  }
}
