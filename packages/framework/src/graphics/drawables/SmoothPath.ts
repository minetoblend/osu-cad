import type { ColorSource } from 'pixi.js';
import { BufferImageSource, Color, Texture } from 'pixi.js';
import { Cached } from "../../caching/Cached";
import { ReadonlyDependencyContainer } from "../../di/DependencyContainer";
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
    const raw = new Float32Array(textureWidth * 4);
    const aa_portion = 0.02;

    for (let i = 0; i < textureWidth; i++) {
      const progress = i / (textureWidth - 1);

      const { r, g, b, a } = new Color(this.colorAt(progress)).toRgba();

      raw[i * 4] = r;
      raw[i * 4 + 1] = g;
      raw[i * 4 + 2] = b;
      raw[i * 4 + 3] = a * Math.min(progress / aa_portion, 1);
    }

    const source = new BufferImageSource({
      resource: raw,
      width: textureWidth,
      height: 1,
      format: 'rgba32float',
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
