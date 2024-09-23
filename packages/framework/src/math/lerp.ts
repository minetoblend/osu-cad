import { Color, type ColorSource } from '../pixi';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(a: ColorSource, b: ColorSource, t: number): Color {
  const colorA = new Color(a);
  const colorB = new Color(b);

  return new Color({
    r: lerp(colorA.red, colorB.red, t),
    g: lerp(colorA.green, colorB.green, t),
    b: lerp(colorA.blue, colorB.blue, t),
  });
}
