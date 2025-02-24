import type { IResourceStore, PIXITexture } from '@osucad/framework';
import { type IResourcesProvider, Skin } from '@osucad/core';
import { ArgonSkinResources } from '@osucad/resources';

export class ArgonSkin extends Skin {
  constructor(resources: IResourcesProvider, configurationFilename?: string) {
    super(
      {
        creator: '',
        name: 'Argon',
      },
      resources,
      new ArgonSkinResourceStore(),
      configurationFilename,
    );
  }

  override async load(): Promise<void> {
    await super.load();

    if (this.textures)
      this.textures.addSpritesheet(await ArgonSkinResources.getSpriteSheet());

    await Promise.all(
      Object.keys(ArgonSkinResources.samples).map(key => this.samples?.loadSample(key)),
    );
  }

  override getTexture(componentName: string): PIXITexture | null {
    return this.textures?.get(componentName) ?? null;
  }
}

class ArgonSkinResourceStore implements IResourceStore<ArrayBuffer> {
  constructor() {
  }

  #resources = new Map<string, ArrayBuffer>();

  #loaded = new Set<string>();

  #loadPromises = new Map<string, Promise<ArrayBuffer | null>>();

  get(name: string) {
    return this.#resources.get(name) ?? null;
  }

  async getAsync(name: string) {
    if (this.#resources.has(name))
      return this.#resources.get(name)!;

    return this.#load(name);
  }

  canLoad(name: string) {
    return this.getAvailableResources().includes(name);
  }

  #load(name: string) {
    const entry = this.#entries[name];
    if (!entry)
      return null;

    if (this.#loaded.has(name))
      return null;

    if (this.#loadPromises.has(name))
      return this.#loadPromises.get(name)!;

    const promise = fetch(entry)
      .then(t => t.arrayBuffer())
      .then((data) => {
        this.#resources.set(name, data);

        return data;
      })
      .catch(() => {
        console.warn('Failed to load resource', name);
        return null;
      })
      .finally(() => {
        this.#loadPromises.delete(name);
        this.#loaded.add(name);
      });

    this.#loadPromises.set(name, promise);

    return promise;
  }

  #entryMap: Record<string, any> = ArgonSkinResources.samples;

  get #entries() {
    return this.#entryMap;
  }

  getAvailableResources() {
    return Object.keys(this.#entries)
      .map(e => e.replace('/src/assets/skin/', ''));
  }

  dispose(): void {
  }

  has(name: string): boolean {
    return name in this.#entries;
  }
}
