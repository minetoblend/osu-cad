import type { ILerp } from "../types/ILerp";
import { almostEquals, clamp } from "../utils";
import type { Rectangle } from "./Rectangle";

export class Vec2 implements ILerp<Vec2>
{
  public constructor();
  public constructor(xy: number);
  public constructor(x: number, y: number);
  public constructor(
    public x: number = 0,
    public y: number = x,
  )
  {
  }

  public readonly(): Readonly<Vec2>
  {
    return this;
  }

  public add(v: IVec2): Vec2
  {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  public addF(f: number): Vec2
  {
    return new Vec2(this.x + f, this.y + f);
  }

  public sub(v: IVec2): Vec2
  {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public subF(f: number): Vec2
  {
    return new Vec2(this.x - f, this.y - f);
  }

  public mul(v: IVec2): Vec2
  {
    return new Vec2(this.x * v.x, this.y * v.y);
  }

  public mulF(f: number): Vec2
  {
    return new Vec2(this.x * f, this.y * f);
  }

  public scale(f: number): Vec2
  {
    return new Vec2(this.x * f, this.y * f);
  }

  public div(v: IVec2): Vec2
  {
    return new Vec2(this.x / v.x, this.y / v.y);
  }

  public divF(f: number): Vec2
  {
    return new Vec2(this.x / f, this.y / f);
  }

  public addInPlace(v: IVec2): Vec2
  {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public subInPlace(v: IVec2): Vec2
  {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public mulInPlace(v: IVec2): Vec2
  {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  public divInPlace(v: IVec2): Vec2
  {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  public scaleInPlace(f: number): Vec2
  {
    this.x *= f;
    this.y *= f;
    return this;
  }

  public dot(v: IVec2): number
  {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: IVec2): number
  {
    return this.x * v.y - this.y * v.x;
  }

  public length(): number
  {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public lengthSq(): number
  {
    return this.x * this.x + this.y * this.y;
  }

  public normalize(): Vec2
  {
    const len = this.length();
    return new Vec2(this.x / len, this.y / len);
  }

  public angle(): number
  {
    return Math.atan2(this.y, this.x);
  }

  public angleTo(v: IVec2): number
  {
    return Math.atan2(this.cross(v), this.dot(v));
  }

  public distance(v: IVec2): number
  {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  public distanceSq(v: IVec2): number
  {
    return (this.x - v.x) ** 2 + (this.y - v.y) ** 2;
  }

  public round()
  {
    return new Vec2(Math.round(this.x), Math.round(this.y));
  }

  public clone(): Vec2
  {
    return new Vec2(this.x, this.y);
  }

  public equals(v: IVec2): boolean
  {
    return this.x === v.x && this.y === v.y;
  }

  public componentMin(v: IVec2): Vec2
  {
    return new Vec2(Math.min(this.x, v.x), Math.min(this.y, v.y));
  }

  public componentMax(v: IVec2): Vec2
  {
    return new Vec2(Math.max(this.x, v.x), Math.max(this.y, v.y));
  }

  public withX(x: number): Vec2
  {
    return new Vec2(x, this.y);
  }

  public withY(y: number): Vec2
  {
    return new Vec2(this.x, y);
  }

  public toString(): string
  {
    return `Vec2(${this.x}, ${this.y})`;
  }

  public static from(v: IVec2): Vec2
  {
    return new Vec2(v.x, v.y);
  }

  public static zero(): Vec2
  {
    return new Vec2(0);
  }

  public static one(): Vec2
  {
    return new Vec2(1);
  }

  public lerp(target: Vec2, t: number): Vec2
  {
    return new Vec2(this.x + (target.x - this.x) * t, this.y + (target.y - this.y) * t);
  }

  public static add(a: IVec2, b: IVec2): Vec2
  {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  public static sub(a: IVec2, b: IVec2): Vec2
  {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  public static mul(a: IVec2, b: IVec2): Vec2
  {
    return new Vec2(a.x * b.x, a.y * b.y);
  }

  public static div(a: IVec2, b: IVec2): Vec2
  {
    return new Vec2(a.x / b.x, a.y / b.y);
  }

  public static scale(v: IVec2, f: number): Vec2
  {
    return new Vec2(v.x * f, v.y * f);
  }

  public static equals(a: IVec2, b: IVec2): boolean
  {
    return a.x === b.x && a.y === b.y;
  }

  public static almostEquals(a: IVec2, b: IVec2, epsilon?: number): boolean
  {
    return almostEquals(a.x, b.x, epsilon) && almostEquals(a.y, b.y, epsilon);
  }

  public static distance(a: IVec2, b: IVec2): number
  {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  public static distanceSq(a: IVec2, b: IVec2): number
  {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }

  public static lerp(a: IVec2, b: IVec2, t: number): Vec2
  {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  public static closerThan(a: IVec2, b: IVec2, threshold: number): boolean
  {
    return Vec2.distanceSq(a, b) < threshold * threshold;
  }

  public static closerThanSq(a: IVec2, b: IVec2, threshold: number): boolean
  {
    return Vec2.distanceSq(a, b) < threshold;
  }

  public rotate(angle: number): Vec2
  {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  public get isZero(): boolean
  {
    return this.x === 0 && this.y === 0;
  }

  public get isOne(): boolean
  {
    return this.x === 1 && this.y === 1;
  }

  public clamp(bounds: Rectangle)
  {
    const { x, y, width, height } = bounds;

    return new Vec2(
        clamp(this.x, x, x + width),
        clamp(this.y, y, y + height),
    );
  }
}

export interface IVec2
{
  x: number;
  y: number;
}
