import { SmoothPath } from "@osucad/framework";
import { Color } from "pixi.js";

export class DrawableSliderPath extends SmoothPath
{
  public static readonly BORDER_PORTION = 0.128;
  public static readonly GRADIENT_PORTION = 1 - this.BORDER_PORTION;

  public static readonly border_max_size = 8;
  public static readonly border_min_size = 0;

  #borderColor = new Color(0xFFFFFF);

  public get borderColor()
  {
    return this.#borderColor;
  }

  public set borderColor(value)
  {
    if (this.#borderColor.toNumber() === value.toNumber())
      return;

    this.#borderColor = value;
    this.invalidateTexture();
  }

  #accentColor = new Color(0xFFFFFF);

  public get accentColor()
  {
    return this.#accentColor;
  }

  public set accentColor(value)
  {
    if (this.#accentColor.toNumber() === value.toNumber())
      return;

    this.#accentColor = value;
    this.invalidateTexture();
  }

  #borderSize = 1;

  public get borderSize()
  {
    return this.#borderSize;
  }

  public set borderSize(value)
  {
    if (this.#borderSize === value)
      return;
    this.#borderSize = value;
    this.invalidateTexture();
  }

  protected get calculatedBorderPortion()
  {
    return this.borderSize * DrawableSliderPath.BORDER_PORTION;
  }
}
