export interface IVec2 {
  x: number;
  y: number;
}

export class Vec2 implements IVec2 {
  constructor();
  constructor(xy: number);
  constructor(x: number, y: number);

  constructor(
    public x: number = 0,
    public y: number = x,
  ) {}

  static from(other: IVec2) {
    return new Vec2(other.x, other.y);
  }

  static equals(a: IVec2, b: IVec2) {
    return a.x === b.x && a.y === b.y;
  }

  static distance(a: IVec2, b: IVec2) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  static distanceSquared(a: IVec2, b: IVec2) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  static closerThan(a: IVec2, b: IVec2, distance: number) {
    return Vec2.distanceSquared(a, b) < distance * distance;
  }

  static closerThanSquared(a: IVec2, b: IVec2, distanceSquared: number) {
    return Vec2.distanceSquared(a, b) < distanceSquared;
  }

  static add(a: IVec2, b: IVec2) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a: IVec2, b: IVec2) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static mul(a: IVec2, b: IVec2) {
    return new Vec2(a.x * b.x, a.y * b.y);
  }

  static scale(a: IVec2, s: number) {
    return new Vec2(a.x * s, a.y * s);
  }

  static zero() {
    return new Vec2();
  }

  static normalize(a: IVec2) {
    const length = Math.sqrt(a.x * a.x + a.y * a.y);
    return new Vec2(a.x / length, a.y / length);
  }

  static lengthSquared(a: IVec2) {
    return a.x * a.x + a.y * a.y;
  }

  static min(a: IVec2, b: IVec2) {
    return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
  }

  static max(a: IVec2, b: IVec2) {
    return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
  }

  static lerp(a: IVec2, b: IVec2, w: number) {
    return new Vec2(a.x + (b.x - a.x) * w, a.y + (b.y - a.y) * w);
  }

  static dot(a: IVec2, b: IVec2) {
    return a.x * b.x + a.y * b.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  equals(other: IVec2) {
    return Vec2.equals(this, other);
  }

  distanceTo(other: IVec2) {
    return Vec2.distance(this, other);
  }

  static rotate(a: IVec2, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(a.x * cos - a.y * sin, a.x * sin + a.y * cos);
  }

  add(other: IVec2) {
    return Vec2.add(this, other);
  }

  sub(other: IVec2) {
    return Vec2.sub(this, other);
  }

  mul(other: IVec2) {
    return Vec2.mul(this, other);
  }

  scale(s: number) {
    return Vec2.scale(this, s);
  }

  normalize() {
    return Vec2.normalize(this);
  }

  min(other: IVec2) {
    return Vec2.min(this, other);
  }

  max(other: IVec2) {
    return Vec2.max(this, other);
  }

  lerp(other: IVec2, w: number) {
    return Vec2.lerp(this, other, w);
  }

  rotate(angle: number) {
    return Vec2.rotate(this, angle);
  }
}
