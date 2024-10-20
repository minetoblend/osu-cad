import type { IResourceStore } from '../../editor/src/skinning/IResourceStore';

export class OnlineLazyResourceStore implements IResourceStore<ArrayBuffer> {
  readonly #entries = new Map<string, ArrayBuffer>();

  readonly #loadableResources: string[];

  private constructor(availableResources: string[] = []) {
    this.#loadableResources = availableResources;
  }

  static async create(): Promise<OnlineLazyResourceStore | null> {
    try {
      const response = await fetch('/edit/beatmap/files');
      if (!response.ok) {
        return null;
      }

      const entries = (await response.json()).map((it: string) => it.toLowerCase());
      console.log(entries);

      return new OnlineLazyResourceStore(entries);
    }
    catch (e) {
      console.error(e);
    }

    return null;
  }

  get(key: string): ArrayBuffer | null {
    key = key.toLowerCase();
    return this.#entries.get(key) ?? null;
  }

  async getAsync(key: string): Promise<ArrayBuffer | null> {
    if (this.has(key))
      return this.get(key)!;

    if (!this.canLoad(key))
      return null;

    const path = `/edit/beatmap/files/${key}`;

    try {
      const response = await fetch(path);
      if (!response.ok) {
        return null;
      }

      const data = await response.arrayBuffer();

      this.#entries.set(key.toLowerCase(), data);

      return data;
    }
    catch (e) {
      console.error('Error when loading resource', key, e);
      return null;
    }
  }

  getAvailableResources(): string[] {
    return this.#loadableResources;
  }

  canLoad(key: string): boolean {
    return this.#loadableResources.includes(key.toLowerCase());
  }

  has(key: string): boolean {
    key = key.toLowerCase();
    return this.#entries.has(key);
  }

  dispose() {
    this.#entries.clear();
  }
}
