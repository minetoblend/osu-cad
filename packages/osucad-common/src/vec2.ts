export type Vec2 = {
  x: number;
  y: number;
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
}
