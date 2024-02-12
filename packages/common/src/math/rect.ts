import {IVec2, Vec2} from "./vec2";

export class Rect {

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {
  }

  get position(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  set position(value: Vec2) {
    this.x = value.x;
    this.y = value.y;
  }

  get size(): Vec2 {
    return new Vec2(this.width, this.height);
  }

  set size(value: Vec2) {
    this.width = value.x;
    this.height = value.y;
  }

  splitLeft(width: number): Rect {
    const rect = new Rect(this.x, this.y, width, this.height);
    this.x += width;
    this.width -= width;
    return rect;
  }

  splitRight(width: number): Rect {
    const rect = new Rect(this.x + this.width - width, this.y, width, this.height);
    this.width -= width;
    return rect;
  }

  splitTop(height: number): Rect {
    const rect = new Rect(this.x, this.y, this.width, height);
    this.y += height;
    this.height -= height;
    return rect;
  }

  splitBottom(height: number): Rect {
    this.height -= height;
    return new Rect(this.x, this.y + this.height, this.width, height);
  }

  withPosition(position: IVec2): Rect {
    return new Rect(position.x, position.y, this.width, this.height);
  }

  withSize(size: IVec2): Rect {
    return new Rect(this.x, this.y, size.x, size.y);
  }

  addPoint(point: IVec2) {
    const x = Math.min(this.x, point.x);
    const y = Math.min(this.y, point.y);
    const right = Math.max(this.x + this.width, point.x);
    const bottom = Math.max(this.y + this.height, point.y);
    this.x = x;
    this.y = y;
    this.width = right - x;
    this.height = bottom - y;
  }

  shrink(amount: number) {
    this.x += amount;
    this.y += amount;
    this.width -= amount * 2;
    this.height -= amount * 2;
  }

  translate({x, y}: IVec2) {
    this.x += x;
    this.y += y;
  }

  static containingPoints(points: IVec2[]): Rect | undefined {
    if (points.length === 0) return undefined;
    const rect = new Rect(points[0].x, points[0].y, 0, 0);
    for (const point of points) {
      rect.addPoint(point);
    }
    return rect;
  }

  get center(): Vec2 {
    return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
  }

  get right(): number {
    return this.x + this.width;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  get left(): number {
    return this.x;
  }

  get top(): number {
    return this.y;
  }

}