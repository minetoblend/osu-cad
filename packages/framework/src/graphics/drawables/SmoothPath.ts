import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Cached } from '@osucad/framework';
import { BufferImageSource, Color, Texture } from 'pixi.js';
import { Path } from './Path';

export class SmoothPath extends Path {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#validateTexture();
  }

  override get pathRadius() {
    return super.pathRadius;
  }

  override set pathRadius(value) {
    if (this.pathRadius === value)
      return;

    super.pathRadius = value;
    this.invalidateTexture();
  }

  readonly #textureCache = new Cached();

  protected invalidateTexture() {
    this.#textureCache.invalidate();
  }

  #validateTexture() {
    if (this.#textureCache.isValid)
      return;

    const textureWidth = Math.floor(this.pathRadius) * 2;
    const raw = new Uint8Array(textureWidth * 4);
    const aa_portion = 0.02;

    for (let i = 0; i < textureWidth; i++) {
      const progress = i / (textureWidth - 1);

      const { r, g, b, a } = new Color(this.colorAt(progress)).toRgba();

      raw[i * 4] = Math.round(r * 255);
      raw[i * 4 + 1] = Math.round(g * 255);
      raw[i * 4 + 2] = Math.round(b * 255);
      raw[i * 4 + 3] = Math.round(a * Math.min(progress / aa_portion, 1) * 255);
    }

    const source = new BufferImageSource({
      resource: raw,
      width: textureWidth,
      height: 1,
      // Linear filtering of 32-bit float textures requires an optional WebGL extension.
      format: 'rgba8unorm',
      scaleMode: 'linear',
    });

    const prevTexture = this.texture;

    this.texture = new Texture({ source });

    if (prevTexture !== Texture.WHITE)
      prevTexture.destroy(true);

    this.#textureCache.validate();
  }

  colorAt(position: number): ColorSource {
    return 0xFFFFFF;
  }

  override updateSubTreeTransforms(): boolean {
    if (!super.updateSubTreeTransforms())
      return false;

    this.#validateTexture();

    return true;
  }
}
