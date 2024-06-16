import { Graphics } from "pixi.js";
import { Drawable, DrawableOptions } from "./Drawable";
import { Invalidation } from "./Invalidation";

export interface RoundedBoxOptions extends DrawableOptions {
  color?: number;
  cornerRadius?: number;
  fillAlpha?: number;
  outlines?: OutlineInfo[];
}

export interface OutlineInfo {
  color: number;
  width?: number;
  alpha?: number;
  alignment?: number;
}

export class RoundedBox extends Drawable {
  constructor(options: RoundedBoxOptions = {}) {
    const { color, fillAlpha, cornerRadius, outlines, ...rest } = options;
    super(rest);

    if (color !== undefined) this.color = color;
    if (fillAlpha !== undefined) this.fillAlpha = fillAlpha;
    if (cornerRadius !== undefined) this.cornerRadius = cornerRadius;
    if (outlines !== undefined) this.outlines = outlines;
  }

  drawNode = new Graphics();

  #cornerRadius = 0;

  get cornerRadius() {
    return this.#cornerRadius;
  }

  set cornerRadius(value: number) {
    this.#cornerRadius = value;
    this.invalidate(Invalidation.Geometry);
  }

  #outlines: OutlineInfo[] = [];

  get outlines() {
    return this.#outlines;
  }

  set outlines(value: OutlineInfo[]) {
    this.#outlines = value;
    this.invalidate(Invalidation.Geometry);
  }

  override handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & (Invalidation.DrawSize | Invalidation.Geometry)) {
      this.drawNode
        .clear()
        .roundRect(0, 0, this.drawSize.x, this.drawSize.y, this.cornerRadius)
        .fill({ color: this.color, alpha: this.fillAlpha });

      for (const outline of this.outlines) {
        this.drawNode
          .beginPath()
          .roundRect(0, 0, this.drawSize.x, this.drawSize.y, this.cornerRadius)
          .stroke({
            color: outline.color,
            width: outline.width ?? 1,
            alpha: outline.alpha ?? 1,
            alignment: outline.alignment ?? 0.5,
          });
      }
    }
  }

  #color = 0xffffff;

  get color() {
    return this.#color;
  }

  set color(value: number) {
    this.#color = value;
    this.invalidate(Invalidation.Geometry);
  }

  #fillAlpha = 1;

  get fillAlpha() {
    return this.#fillAlpha;
  }

  set fillAlpha(value: number) {
    this.#fillAlpha = value;
    this.invalidate(Invalidation.Geometry);
  }
}
