import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { IResourceStore } from './IResourceStore';
import type { SkinInfo } from './SkinInfo';
import { StableSkin } from './stable/StableSkin';

export async function createDefaultSkin(resourceProvider: IResourcesProvider) {
  const store = new DefaultSkinResourceStore();

  const info: SkinInfo = {
    name: 'Default',
    creator: '',
  };

  const skin = new StableSkin(info, resourceProvider, store);

  await skin.load();

  return skin;
}

class DefaultSkinResourceStore implements IResourceStore<ArrayBuffer> {
  constructor() {
    console.log(this.getAvailableResources());
  }

  #resources = new Map<string, ArrayBuffer>();

  #loaded = new Set<string>();

  #loadPromises = new Map<string, Promise<ArrayBuffer | null>>();

  get(name: string) {
    return this.#resources.get(name) ?? null;
  }

  async getAsync(name: string) {
    if (this.#resources.has(name)) {
      return this.#resources.get(name)!;
    }

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

        console.log('Loaded resource', name, data.byteLength);

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

  #entryMap?: Record<string, any>;

  get #entries() {
    if (!this.#entryMap) {
      this.#entryMap = {};

      const entries = import.meta.glob('../assets/skin/*', {
        eager: true,
        query: '?url',
        import: 'default',
      });

      for (const key in entries) {
        this.#entryMap[key.replace('../assets/skin/', '')] = entries[key];
      }
    }

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
