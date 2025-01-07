import { Texture } from 'pixi.js';
import { Vec2 } from '../../math';
import { PIXIContainer, PIXISprite } from '../../pixi';
import { Axes } from './Axes';
import { Drawable, type DrawableOptions, Invalidation } from './Drawable';

export interface DrawableSpriteOptions extends DrawableOptions {
  texture?: Texture | null;
}

export class DrawableSprite extends Drawable {
  constructor(options: DrawableSpriteOptions = {}) {
    super();

    this.#sprite = new PIXISprite();

    this.with(options);

    if (options.texture) {
      if (
        !options.size
        && options.width === undefined
        && options.height === undefined
        && (options.relativeSizeAxes ?? Axes.None) === Axes.None
      ) {
        const size = new Vec2(options.texture.width, options.texture.height);

        if (options.texture.label?.endsWith('@2x') && options.texture.source.resolution !== 2)
          size.scaleInPlace(options.texture.source.resolution / 2);

        this.size = size;
        this.resizeToTexture = true;
      }
    }
  }

  readonly #sprite: PIXISprite;

  resizeToTexture = false;

  override createDrawNode() {
    return new PIXIContainer({
      children: [this.#sprite],
    });
  }

  #texture: Texture | null = null;

  get texture(): Texture | null {
    return this.#texture;
  }

  set texture(value: Texture | null) {
    if (this.#texture === value)
      return;

    this.#texture = value;

    this.#sprite.texture = value || Texture.EMPTY;

    this.fillAspectRatio = (value?.width ?? 1) / (value?.height ?? 1);

    this.invalidate(Invalidation.DrawSize | Invalidation.Transform);
  }

  override updateDrawNodeTransform(): void {
    super.updateDrawNodeTransform();

    const drawSize = this.drawSize;

    this.#sprite.setSize(drawSize.x, drawSize.y);
  }
}
