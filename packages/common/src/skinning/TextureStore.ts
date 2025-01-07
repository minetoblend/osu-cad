import type { IResourceStore } from 'osucad-framework';
import type { Spritesheet, Texture, TextureSource } from 'pixi.js';
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

  readonly #spriteSheets: Spritesheet[] = [];

  addSpritesheet(spritesheet: Spritesheet) {
    this.#spriteSheets.push(spritesheet);
  }

  #getFromSpritesheet(name: string) {
    for (const spritesheet of this.#spriteSheets) {
      if (spritesheet.textures[name]) {
        const texture = spritesheet.textures[name];

        texture.label ??= name;

        this.#textures.set(name, texture);

        return texture;
      }
    }
    return null;
  }

  #textures = new Map<string, Texture | null>();

  canLoad(name: string) {
    return this.#store.canLoad(name) || !!this.#getFromSpritesheet(name);
  }

  async load(name: string, resolution = 1) {
    const existing = this.get(name, resolution);
    if (existing)
      return existing;

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
    if (this.#textures.has(name))
      return this.#textures.get(name)!;

    const fromSpriteSheet = this.#getFromSpritesheet(name);
    if (fromSpriteSheet)
      return fromSpriteSheet;

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
