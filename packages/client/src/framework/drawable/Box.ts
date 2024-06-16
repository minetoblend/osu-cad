import { Container, Sprite, Texture } from "pixi.js";
import { Drawable, DrawableOptions } from "./Drawable";
import { Invalidation } from "./Invalidation";

export interface BoxOptions extends DrawableOptions {
  color?: number;
}



export class Box extends Drawable {
  constructor(options: BoxOptions = {}) {
    const { color, ...rest } = options;
    super(rest);

    if (color !== undefined) this.color = color;
  }


  boxSprite = new Sprite({
    texture: Texture.WHITE,
  });

  drawNode = new Container({
    children: [this.boxSprite],
  });

  override handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.DrawSize) {
      this.boxSprite.width = this.drawSize.x * this.scale.x;
      this.boxSprite.height = this.drawSize.y * this.scale.y;
    }
  }

  get color() {
    return this.drawNode.tint;
  }

  set color(value: number) {
    this.drawNode.tint = value;
  }
}
