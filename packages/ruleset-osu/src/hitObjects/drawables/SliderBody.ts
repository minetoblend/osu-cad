import type { Path } from "@osucad/framework";
import { CompositeDrawable, Vec2 } from "@osucad/framework";
import type { ColorSource } from "pixi.js";
import { Color } from "pixi.js";
import { DrawableSliderPath } from "./DrawableSliderPath";

export class SliderBody extends CompositeDrawable
{
  #path!: DrawableSliderPath;

  protected get path(): Path
  {
    return this.#path;
  }

  public get pathRadius()
  {
    return this.#path.pathRadius;
  }

  public set pathRadius(value)
  {
    this.#path.pathRadius = value;
  }

  public get accentColor()
  {
    return this.#path.accentColor;
  }

  public set accentColor(value)
  {
    this.#path.accentColor = value;
  }

  public override get borderColor()
  {
    return this.#path.borderColor;
  }

  public override set borderColor(value)
  {
    this.#path.borderColor = value;
  }

  public get borderSize()
  {
    return this.#path.borderSize;
  }

  public set borderSize(value)
  {
    this.#path.borderSize = value;
  }

  protected constructor()
  {
    super();

    this.recyclePath();
  }

  public recyclePath()
  {
    this.internalChild = this.#path = this.createSliderPath().adjust((p) =>
    {
      p.position = this.#path?.position ?? Vec2.zero();
      p.pathRadius = this.#path?.pathRadius ?? 10;
      p.accentColor = this.#path?.accentColor ?? new Color("white");
      p.borderColor = this.#path?.borderColor ?? new Color("white");
      p.borderSize = this.#path?.borderSize ?? 1;
      p.vertices = this.#path?.vertices ?? [];
    });
  }

  protected setVertices(vertices: readonly Vec2[])
  {
    this.#path.vertices = vertices;
  }

  protected createSliderPath(): DrawableSliderPath
  {
    return new DefaultDrawableSliderPath();
  }
}

class DefaultDrawableSliderPath extends DrawableSliderPath
{
  protected override colorAt(position: number): ColorSource
  {
    if (this.calculatedBorderPortion !== 0 && position <= this.calculatedBorderPortion)
      return this.borderColor;

    position -= this.calculatedBorderPortion;

    const opacity_at_centre = 0.3;
    const opacity_at_edge = 0.8;

    const { r, g, b, a } = this.accentColor.toRgba();

    const opacity = (opacity_at_edge - (opacity_at_edge - opacity_at_centre) * position / DefaultDrawableSliderPath.GRADIENT_PORTION);

    return new Color([r, g, b, opacity * a]);
  }
}
