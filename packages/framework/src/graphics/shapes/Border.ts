import type { ILerp } from "../../types/ILerp";
import { lerp, lerpColor } from "../../math/lerp";

export interface BorderOptions
{
  width?: number;
  color?: number;
  alignment?: number;
}

export class Border implements BorderOptions, ILerp<Border>
{
  readonly width: number;
  readonly color: number;
  readonly alignment: number;

  constructor(options: BorderOptions = {})
  {
    this.width = options.width ?? 1;
    this.color = options.color ?? 0xFFFFFF;
    this.alignment = options.alignment ?? 0.5;
  }

  lerp(target: Border, t: number): Border
  {
    return new Border({
      width: lerp(this.width, target.width, t),
      color: lerpColor(this.color, target.color, t).toNumber(),
      alignment: lerp(this.alignment, target.alignment, t),
    });
  }
}
