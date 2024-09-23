import type { Texture } from 'pixi.js';
import type { Drawable } from '../drawables';
import { Vec2 } from '../../math';
import { Anchor, Axes, DrawableSprite } from '../drawables';
import { Animation } from './Animation';

export class TextureAnimation extends Animation<Texture> {
  #textureHolder!: DrawableSprite;

  constructor(startAtCurrentTime: boolean = true) {
    super(startAtCurrentTime);
  }

  protected override createContent(): Drawable {
    return (this.#textureHolder = new DrawableSprite({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }

  protected override displayFrame(content: Texture) {
    this.#textureHolder.texture = content;
  }

  protected override clearDisplay() {
    this.#textureHolder.texture = null;
  }

  protected override getFillAspectRatio(): number {
    return this.#textureHolder.fillAspectRatio;
  }

  protected override getCurrentDisplaySize(): Vec2 {
    return new Vec2(this.#textureHolder.texture?.width ?? 0, this.#textureHolder.texture?.height ?? 0);
  }
}
