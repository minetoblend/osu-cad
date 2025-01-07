import { loadTexture } from "osucad-framework";
import { Texture, TextureSourceOptions } from "pixi.js";

export class LazyTexture {
  constructor(readonly url: string, readonly options?: TextureSourceOptions) {
  }

  #texture?: Texture | null;

  #loadPromise?: Promise<Texture | null>;

  async load() {
    if (this.#texture !== undefined)
      return this.#texture;

    this.#loadPromise ??= this.#load();

    return this.#loadPromise;
  }

  async #load() {
    this.#texture = await loadTexture(this.url, this.options);

    return this.#texture;
  }
}
