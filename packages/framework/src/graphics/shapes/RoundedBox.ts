import { Matrix, type Texture } from "pixi.js";
import { Color, type ColorSource, Graphics } from "pixi.js";
import { FillMode, LayoutMember } from "../drawables";
import { Drawable, type DrawableOptions, Invalidation } from "../drawables/Drawable";

export interface RoundedBoxOptions extends DrawableOptions 
{
  cornerRadius?: number;
  outline?: OutlineInfo;
  outlines?: OutlineInfo[];
  fillColor?: ColorSource;
  fillAlpha?: number;
  texture?: Texture;
  textureFillMode?: FillMode;
}

export interface OutlineInfo 
{
  color: number;
  width?: number;
  alpha?: number;
  alignment?: number;
}

export class RoundedBox extends Drawable 
{
  constructor(options: RoundedBoxOptions = {}) 
  {
    super();

    this.addLayout(this.#graphicsBacking);

    this.with(options);
  }

  get cornerRadius(): number 
  {
    return this.#cornerRadius;
  }

  set cornerRadius(value: number) 
  {
    if (this.#cornerRadius === value)
      return;

    this.#cornerRadius = value;

    this.#graphicsBacking.invalidate();
  }

  #cornerRadius: number = 0;

  #graphics!: Graphics;

  #graphicsBacking = new LayoutMember(Invalidation.DrawSize);

  get texture(): Texture | null 
  {
    return this.#texture;
  }

  set texture(value: Texture | null) 
  {
    if (this.#texture === value)
      return;

    this.#texture = value;

    this.#graphicsBacking.invalidate();
  }

  #texture: Texture | null = null;

  get textureFillMode(): FillMode 
  {
    return this.#textureFillMode;
  }

  set textureFillMode(value: FillMode) 
  {
    if (this.#textureFillMode === value)
      return;

    this.#textureFillMode = value;

    this.#graphicsBacking.invalidate();
  }

  #textureFillMode: FillMode = FillMode.Stretch;

  get outlines(): OutlineInfo[] 
  {
    return this.#outlines;
  }

  set outlines(value: OutlineInfo[]) 
  {
    this.#outlines = value;
    this.#graphicsBacking.invalidate();
  }

  #outlines: OutlineInfo[] = [];

  get outline(): OutlineInfo | undefined 
  {
    return this.#outlines[0];
  }

  set outline(value: OutlineInfo | undefined) 
  {
    this.#outlines = value ? [value] : [];
    this.#graphicsBacking.invalidate();
  }

  override createDrawNode(): Graphics 
  {
    return (this.#graphics = new Graphics());
  }

  override update() 
  {
    super.update();

    if (!this.#graphicsBacking.isValid) 
    {
      this.#updateGraphics();
      this.#graphicsBacking.validate();
    }
  }

  get fillAlpha(): number 
  {
    return this.#fillAlpha;
  }

  set fillAlpha(value: number) 
  {
    if (this.#fillAlpha === value)
      return;

    this.#fillAlpha = value;

    this.#graphicsBacking.invalidate();
  }

  #fillAlpha = 1;

  get fillColor(): Color 
  {
    return this.#fillColor;
  }

  set fillColor(value: ColorSource) 
  {
    this.#fillColor.setValue(value);

    this.#graphicsBacking.invalidate();
  }

  #fillColor = new Color(0xFFFFFF);

  #updateGraphics() 
  {
    const g = this.#graphics;

    g.clear();
    if (this.#cornerRadius > 0) 
    {
      g.roundRect(0, 0, this.drawSize.x, this.drawSize.y, this.#cornerRadius);
    }
    else 
    {
      g.rect(0, 0, this.drawSize.x, this.drawSize.y);
    }

    if (this.#texture) 
    {
      let width = this.#texture.width;
      let height = this.#texture.height;

      const aspectRatio = this.drawSize.x / this.drawSize.y;

      if (this.#textureFillMode === FillMode.Fill) 
      {
        if (width / height > aspectRatio) 
        {
          width = height * aspectRatio;
        }
        else 
        {
          height = width / aspectRatio;
        }
      }
      else if (this.#textureFillMode === FillMode.Fit) 
      {
        if (width / height > aspectRatio) 
        {
          height = width / aspectRatio;
        }
        else 
        {
          width = height * aspectRatio;
        }
      }

      width = this.drawSize.x / width;
      height = this.drawSize.y / height;

      g.fill({
        texture: this.#texture,
        color: this.#fillColor,
        alpha: this.#fillAlpha,
        matrix: new Matrix()
          .scale(width, height)
          .translate(
              (this.drawSize.x - this.#texture.width * width) / 2,
              (this.drawSize.y - this.#texture.height * height) / 2,
          ),
      });
    }
    else 
    {
      g.fill({
        color: this.fillColor,
        alpha: this.#fillAlpha,
      });
    }

    for (const outline of this.#outlines) 
    {
      if (this.#cornerRadius > 0) 
      {
        g.roundRect(0, 0, this.drawSize.x, this.drawSize.y, this.#cornerRadius);
      }
      else 
      {
        g.rect(0, 0, this.drawSize.x, this.drawSize.y);
      }
      g.stroke({
        color: outline.color,
        width: outline.width ?? 1,
        alpha: outline.alpha ?? 1,
        alignment: outline.alignment ?? 0.5,
      });
    }
  }
}
