import type { AudioChannel, IResourceStore, Sample } from 'osucad-framework';
import type { HitSample } from '../../hitsounds/HitSample';
import type { IResourcesProvider } from '../../io/IResourcesProvider';
import type { SkinInfo } from '../SkinInfo';
import { StableSkin } from '../stable/StableSkin';

export class DefaultSkin extends StableSkin {
  constructor(resourceProvider: IResourcesProvider) {
    const info: SkinInfo = {
      name: 'Default',
      creator: '',
    };

    super(info, resourceProvider, new DefaultSkinResourceStore());
  }

  override getSample(channel: AudioChannel, sample: string | HitSample): Sample | null {
    if (typeof sample !== 'string') {
      const name = sample.sampleName;
      if (name) {
        const sample = this.samples?.getSample(channel, name);
        if (sample)
          return sample;
      }
    }

    return super.getSample(channel, sample);
  }
}

class DefaultSkinResourceStore implements IResourceStore<ArrayBuffer> {
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

  #entryMap?: Record<string, any>;

  get #entries() {
    if (!this.#entryMap) {
      this.#entryMap = {};

      const entries = import.meta.glob('../../assets/skin/*', {
        eager: true,
        query: '?url',
        import: 'default',
      });

      for (const key in entries) {
        this.#entryMap[key.replace('../../assets/skin/', '')] = entries[key];
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
