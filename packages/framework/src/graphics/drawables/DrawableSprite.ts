import type { IVec2 } from '../../math';
import { Texture } from 'pixi.js';
import { Vec2 } from '../../math';
import { PIXIContainer } from '../../pixi';
import { MatrixUtils } from '../../utils/MatrixUtils';
import { Axes } from './Axes';
import { Drawable, type DrawableOptions, Invalidation } from './Drawable';
import { LayoutComputed } from './LayoutComputed';
import { SpriteDrawNode } from './SpriteDrawNode';

export interface DrawableSpriteOptions extends DrawableOptions {
  texture?: Texture | null;
  edgeSmoothness?: number;
}

export class DrawableSprite extends Drawable {
  constructor(options: DrawableSpriteOptions = {}) {
    super();

    this.addLayout(this.#inflationAmountBacking);

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

  readonly #sprite = new SpriteDrawNode(this);

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

  #edgeSmoothness = new Vec2(0);

  get edgeSmoothness(): Vec2 {
    return this.#edgeSmoothness;
  }

  set edgeSmoothness(value: number | IVec2) {
    value = typeof value === 'number' ? new Vec2(value) : Vec2.from(value);
    if (this.#edgeSmoothness.equals(value))
      return;

    this.#edgeSmoothness = value as Vec2;

    this.invalidate(Invalidation.Transform);
  }

  get inflationAmount() {
    return this.#inflationAmountBacking.value;
  }

  #inflationAmountBacking = new LayoutComputed(() => this.#computeInflationAmount(), Invalidation.Transform);

  #computeInflationAmount() {
    if (this.#edgeSmoothness.isZero)
      return Vec2.zero();

    const scale = MatrixUtils.extractScale(this.drawNode.relativeGroupTransform);

    return this.#edgeSmoothness.div(scale);
  }
}
