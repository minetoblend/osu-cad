import type { IResourceStore } from 'osucad-framework';
import type { Texture, TextureSource } from 'pixi.js';
import { loadTexture, ResourceStore } from 'osucad-framework';
import { ImageSource } from 'pixi.js';

export class TextureStore {
  readonly #store = new ResourceStore<ArrayBuffer>();

  constructor(resources: IResourceStore<ArrayBuffer>) {
    this.#store.addStore(resources);
    this.#store.addExtension('png');
    this.#store.addExtension('jpg');
  }

  dispose(disposing = true) {
    for (const texture of this.#textures.values()) {
      texture?.destroy(true);
    }
  }

  #textures = new Map<string, Texture | null>();

  canLoad(name: string) {
    return this.#store.canLoad(name);
  }

  async load(name: string, resolution = 1) {
    if (this.#textures.has(name))
      return this.#textures.get(name)!;

    const data = await this.#store.getAsync(name);

    if (!data)
      return null;

    const texture = await loadTexture(data, {
      resolution,
      autoGenerateMipmaps: true,
    });

    if (!texture)
      return null;

    this.#textures.set(name, texture);

    return texture;
  }

  get(name: string, resolution: number = 1): Texture | null {
    if (this.#textures.has(name)) {
      return this.#textures.get(name)!;
    }

    return null;
  }

  async #createTextureSource(label: string, data: ArrayBuffer, resolution: number): Promise<TextureSource | null> {
    try {
      const imageBitmap = await createImageBitmap(new Blob([data]));

      return new ImageSource({
        resource: imageBitmap,
        alphaMode: 'premultiply-alpha-on-upload',
        label,
        resolution,
        autoGenerateMipmaps: true,
      });
    }
    catch (e) {
      console.error('Failed to load texture', label, e);
    }

    return null;
  }
}
