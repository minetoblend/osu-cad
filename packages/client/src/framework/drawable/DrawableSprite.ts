import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { Drawable, DrawableOptions } from './Drawable';
import { Invalidation } from './Invalidation';
import { Axes } from './Axes.ts';

export interface DrawableSpriteOptions extends DrawableOptions {
  texture?: string | Texture;
  color?: number;
}

export class DrawableSprite extends Drawable {
  constructor(options: DrawableSpriteOptions = {}) {
    const { texture, ...rest } = options;
    super(rest);

    if (typeof texture === 'string') {
      Assets.load(texture).then((texture) => {
        this.texture = texture;
      });
    } else if (texture) {
      this.texture = texture;
      if (!(this.relativeSizeAxes & Axes.X)) {
        this.width = texture.width;
      }
      if (!(this.relativeSizeAxes & Axes.Y)) {
        this.height = texture.height;
      }
    }

    if (options.color) {
      this.color = options.color;
    }
  }

  sprite = new Sprite();

  override drawNode = new Container({
    children: [this.sprite],
  });

  set texture(texture: Texture) {
    this.sprite.texture = texture;
  }

  get texture() {
    return this.sprite.texture;
  }

  override handleInvalidations(): void {
    super.handleInvalidations();

    if (this._invalidations & Invalidation.DrawSize) {
      this.sprite.width = this.drawSize.x;
      this.sprite.height = this.drawSize.y;
    }
  }

  get color() {
    return this.sprite.tint;
  }

  set color(value: number) {
    this.sprite.tint = value;
  }
}
