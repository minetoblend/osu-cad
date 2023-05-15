export type Vec2 = {
  readonly x: number;
  readonly y: number;
};

export namespace Vec2 {
  export function zero(): Vec2 {
    return { x: 0, y: 0 };
  }

  export function add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  export function sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  export function mul(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x * b.x, y: a.y * b.y };
  }

  export function div(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x / b.x, y: a.y / b.y };
  }

  export function scale(a: Vec2, b: number): Vec2 {
    return { x: a.x * b, y: a.y * b };
  }

  export function length(a: Vec2): number {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  }

  export function lengthSquared(a: Vec2): number {
    return a.x * a.x + a.y * a.y;
  }

  export function normalize(a: Vec2): Vec2 {
    const len = length(a);
    return { x: a.x / len, y: a.y / len };
  }

  export function dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
  }

  export function cross(a: Vec2, b: Vec2): number {
    return a.x * b.y - a.y * b.x;
  }

  export function distance(a: Vec2, b: Vec2): number {
    return length(sub(a, b));
  }

  export function distanceSq(a: Vec2, b: Vec2): number {
    return (
      a.x * a.x +
      a.y * a.y -
      2 * (a.x * b.x + a.y * b.y) +
      b.x * b.x +
      b.y * b.y
    );
  }

  export function round(a: Vec2): Vec2 {
    return { x: Math.round(a.x), y: Math.round(a.y) };
  }

  export function clone(a: Vec2): Vec2 {
    return { x: a.x, y: a.y };
  }

  export function create(x: number, y: number): Vec2 {
    return { x, y };
  }

  export function average(...points: Vec2[]): Vec2 {
    const sum = points.reduce((acc, p) => add(acc, p), zero());
    return scale(sum, 1 / points.length);
  }

  export function equals(a: Vec2, b: Vec2): boolean {
    return a.x === b.x && a.y === b.y;
  }

  export function lerp(a: Vec2, b: Vec2, f: number): Vec2 {
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
    };
  }
}
