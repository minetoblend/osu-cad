import { IResourceStore } from '@osucad/editor';

export class LazyStableResourceStore implements IResourceStore<ArrayBuffer> {

  readonly #entries = new Map<string, ArrayBuffer>();

  readonly #loadableResources: string[];

  private constructor(readonly directory: string, availableResources: string[] = []) {
    this.#loadableResources = availableResources;
  }

  static async create(path: string): Promise<LazyStableResourceStore | null> {
    try {
      const response = await fetch(path + '&entries');
      if (!response.ok) {
        return null;
      }

      const json = (await response.json()) as {
        name: string;
        isDirectory: boolean;
      }[];

      const entries = json
        .filter(it => !it.isDirectory)
        .map(it => it.name.toLowerCase());

      return new LazyStableResourceStore(path, entries);
    } catch (e) {
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

    const path = `${this.directory}/${key}`;

    try {
      const response = await fetch(path);
      if (!response.ok) {
        return null;
      }

      const data = await response.arrayBuffer();

      this.#entries.set(key.toLowerCase(), data);

      return data;
    } catch (e) {
      console.error('Error when loading resource', key, e)
      return null;
    }
  }

  getAvailableResources(): string[] {
    return [...this.#entries.keys()];
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
