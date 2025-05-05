import type { ILerp } from "../../types";
import type { EasingFunction } from "./EasingFunction";
import { Color } from "pixi.js";
import { lerp } from "../../math";
import { MarginPadding } from "../drawables/MarginPadding";

export class Interpolation 
{
  static valueAt<T>(
    time: number,
    startValue: T,
    endValue: T,
    startTime: number,
    endTime: number,
    easing: EasingFunction,
  ) 
  {
    if (time < startTime)
      return startValue;
    if (time >= endTime)
      return endValue;

    const t = (time - startTime) / (endTime - startTime);
    return this.lerp(startValue, endValue, easing(t));
  }

  private static lerp<T>(startValue: T, endValue: T, t: number): T 
  {
    if (typeof startValue === "number")
      return lerp(startValue, endValue as number, t) as T;

    if (startValue && typeof startValue === "object" && "lerp" in startValue)
      return (startValue as ILerp<T>).lerp(endValue, t);

    if (startValue instanceof Color)
      return this.interpolateColor(startValue, endValue as Color, t) as T;

    if (startValue instanceof MarginPadding && endValue instanceof MarginPadding) 
    {
      return new MarginPadding({
        top: lerp(startValue.top, endValue.top, t),
        bottom: lerp(startValue.bottom, endValue.bottom, t),
        left: lerp(startValue.left, endValue.left, t),
        right: lerp(startValue.right, endValue.right, t),
      }) as T;
    }

    throw new Error("Unsupported interpolation type");
  }

  static interpolateColor(start: Color, end: Color, t: number): Color 
  {
    const startRgba = start.toRgba();
    const endRgba = end.toRgba();

    return new Color({
      r: lerp(startRgba.r, endRgba.r, t) * 255,
      g: lerp(startRgba.g, endRgba.g, t) * 255,
      b: lerp(startRgba.b, endRgba.b, t) * 255,
      a: lerp(startRgba.a, endRgba.a, t),
    });
  }
}
