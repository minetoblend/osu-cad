import type { Graphics } from "pixi.js";
import type { DrawableOptions } from "../drawables/Drawable";
import { GraphicsDrawable } from "../drawables/GraphicsDrawable";

export interface CircleSegmentOptions extends DrawableOptions
{
  startAngle?: number;
  endAngle?: number;
  hollowness?: number;
}

export class CircleSegment extends GraphicsDrawable
{
  public constructor(options: CircleSegmentOptions = {})
  {
    super();

    this.with(options);
  }

  #startAngle = 0;

  #endAngle = Math.PI * 2;

  #hollowness = 0;

  public get hollowness()
  {
    return this.#hollowness;
  }

  public set hollowness(value)
  {
    if (value === this.#hollowness)
      return;

    this.#hollowness = value;
    this.invalidateGraphics();
  }

  public get startAngle()
  {
    return this.#startAngle;
  }

  public set startAngle(value)
  {
    if (value === this.#startAngle)
      return;

    this.#startAngle = value;

    this.invalidateGraphics();
  }

  public get endAngle()
  {
    return this.#endAngle;
  }

  public set endAngle(value)
  {
    if (value === this.#endAngle)
      return;

    this.#endAngle = value;

    this.invalidateGraphics();
  }

  protected override updateGraphics(g: Graphics)
  {
    const radius = Math.min(
        this.drawWidth,
        this.drawHeight,
    ) * 0.5;

    const center = this.drawSize.scale(0.5);

    g.clear()
      .arc(center.x, center.y, radius, this.startAngle, this.endAngle)
      .arc(center.x, center.y, radius * this.hollowness, this.endAngle, this.startAngle, true)
      .closePath()
      .fill(0xFFFFFF);
  }
}
