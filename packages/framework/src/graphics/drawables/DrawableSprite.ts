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

    this.with(options);

    if (options.texture) {
      if (
        !options.size
        && options.width === undefined
        && options.height === undefined
        && (options.relativeSizeAxes ?? Axes.None) === Axes.None
      ) {
        this.size = new Vec2(options.texture.width, options.texture.height);
        this.resizeToTexture = true;
      }
    }
  }

  #sprite!: PIXISprite;

  resizeToTexture = false;

  override createDrawNode() {
    return new PIXIContainer({
      children: [(this.#sprite = new PIXISprite())],
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

    // ensure the draw node is created
    this.drawNode;

    this.#sprite.texture = value || Texture.EMPTY;

    this.fillAspectRatio = (value?.width ?? 1) / (value?.height ?? 1);

    this.invalidate(Invalidation.DrawSize);
  }

  override updateDrawNodeTransform(): void {
    super.updateDrawNodeTransform();

    this.#sprite.setSize(this.drawSize.x, this.drawSize.y);
  }
}
