import type { DrawableOptions } from "../drawables";
import { Direction, GraphicsDrawable } from "../drawables";
import type { ColorSource, Graphics } from "pixi.js";
import { Color, FillGradient } from "pixi.js";

export interface GradientBoxOptions extends DrawableOptions
{
  direction?: Direction;
  from?: ColorSource;
  to?: ColorSource;
}

export class GradientBox extends GraphicsDrawable
{
  public get direction(): Direction
  {
    return this.#direction;
  }

  public set direction(value: Direction)
  {
    if (this.#direction === value)
      return;

    this.#direction = value;
    this.invalidateGraphics();
  }

  public get from(): ColorSource
  {
    return this.#from;
  }

  public set from(value: ColorSource)
  {
    this.#from.setValue(value);
    this.invalidateGraphics();
  }

  public get to(): ColorSource
  {
    return this.#to;
  }

  public set to(value: ColorSource)
  {
    this.#to.setValue(value);
    this.invalidateGraphics();
  }

  #from: Color = new Color(0xffffff);
  #to: Color = new Color(0xffffff);
  #direction = Direction.Horizontal;

  public constructor(options: GradientBoxOptions = {})
  {
    super();

    this.with(options);
  }

  protected override updateGraphics(g: Graphics): void
  {
    const { drawWidth, drawHeight, direction, from, to } = this;

    g.clear().rect(0, 0, drawWidth, drawHeight);

    if (direction === Direction.Horizontal)
    {
      g.fill(new FillGradient({
        type: "linear",
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        colorStops: [
          { color: from, offset: 0 },
          { color: to, offset: 1 },
        ],
        textureSpace: "local",
      }));
    }
    else
    {
      g.fill(new FillGradient({
        type: "linear",
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        colorStops: [
          { color: from, offset: 0 },
          { color: to, offset: 1 },
        ],
        textureSpace: "local",
      }));
    }
  }
}
