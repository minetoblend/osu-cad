import type { Color, Effect } from "pixi.js";
import type { CompositeDrawable } from "../graphics";
import { Matrix } from "pixi.js";

export class MaskingEffect implements Effect
{
  public pipe = "masking";
  public priority = 1;

  public cornerRadius: number = 0;
  public cornerExponent: number = 2.0;
  public borderThickness: number = 0;
  public borderColor?: Color;

  constructor(
    readonly drawable: CompositeDrawable,
  )
  {
  }

  readonly matrix = new Matrix();

  destroy(): void
  {
  }
}
