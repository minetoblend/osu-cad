import type { ILerp } from '../types/ILerp';

export class Vec2 implements ILerp<Vec2> {
  constructor();
  constructor(xy: number);
  constructor(x: number, y: number);
  constructor(
    public x: number = 0,
    public y: number = x,
  ) {
  }

  readonly(): Readonly<Vec2> {
    return this;
  }

  add(v: IVec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  addF(f: number): Vec2 {
    return new Vec2(this.x + f, this.y + f);
  }

  sub(v: IVec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  subF(f: number): Vec2 {
    return new Vec2(this.x - f, this.y - f);
  }

  mul(v: IVec2): Vec2 {
    return new Vec2(this.x * v.x, this.y * v.y);
  }

  mulF(f: number): Vec2 {
    return new Vec2(this.x * f, this.y * f);
  }

  scale(f: number): Vec2 {
    return new Vec2(this.x * f, this.y * f);
  }

  div(v: IVec2): Vec2 {
    return new Vec2(this.x / v.x, this.y / v.y);
  }

  divF(f: number): Vec2 {
    return new Vec2(this.x / f, this.y / f);
  }

  addInPlace(v: IVec2): Vec2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subInPlace(v: IVec2): Vec2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mulInPlace(v: IVec2): Vec2 {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  divInPlace(v: IVec2): Vec2 {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  scaleInPlace(f: number): Vec2 {
    this.x *= f;
    this.y *= f;
    return this;
  }

  dot(v: IVec2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: IVec2): number {
    return this.x * v.y - this.y * v.x;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vec2 {
    const len = this.length();
    return new Vec2(this.x / len, this.y / len);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  angleTo(v: IVec2): number {
    return Math.atan2(this.cross(v), this.dot(v));
  }

  distance(v: IVec2): number {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  distanceSq(v: IVec2): number {
    return (this.x - v.x) ** 2 + (this.y - v.y) ** 2;
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  equals(v: IVec2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  componentMin(v: IVec2): Vec2 {
    return new Vec2(Math.min(this.x, v.x), Math.min(this.y, v.y));
  }

  componentMax(v: IVec2): Vec2 {
    return new Vec2(Math.max(this.x, v.x), Math.max(this.y, v.y));
  }

  withX(x: number): Vec2 {
    return new Vec2(x, this.y);
  }

  withY(y: number): Vec2 {
    return new Vec2(this.x, y);
  }

  toString(): string {
    return `Vec2(${this.x}, ${this.y})`;
  }

  static from(v: IVec2): Vec2 {
    return new Vec2(v.x, v.y);
  }

  static zero(): Vec2 {
    return new Vec2(0);
  }

  static one(): Vec2 {
    return new Vec2(1);
  }

  lerp(target: Vec2, t: number): Vec2 {
    return new Vec2(this.x + (target.x - this.x) * t, this.y + (target.y - this.y) * t);
  }

  static add(a: IVec2, b: IVec2): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static sub(a: IVec2, b: IVec2): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static mul(a: IVec2, b: IVec2): Vec2 {
    return new Vec2(a.x * b.x, a.y * b.y);
  }

  static div(a: IVec2, b: IVec2): Vec2 {
    return new Vec2(a.x / b.x, a.y / b.y);
  }

  static scale(v: IVec2, f: number): Vec2 {
    return new Vec2(v.x * f, v.y * f);
  }

  static equals(a: IVec2, b: IVec2): boolean {
    return a.x === b.x && a.y === b.y;
  }

  static distance(a: IVec2, b: IVec2): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  static distanceSq(a: IVec2, b: IVec2): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }

  static lerp(a: IVec2, b: IVec2, t: number): Vec2 {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  static closerThan(a: IVec2, b: IVec2, threshold: number): boolean {
    return Vec2.distanceSq(a, b) < threshold * threshold;
  }

  static closerThanSq(a: IVec2, b: IVec2, threshold: number): boolean {
    return Vec2.distanceSq(a, b) < threshold;
  }

  rotate(angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  get isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  get isOne(): boolean {
    return this.x === 1 && this.y === 1;
  }
}

export interface IVec2 {
  x: number;
  y: number;
}
