import { IResourceStore } from '@osucad/editor';

export class StableResourceStore implements IResourceStore<ArrayBuffer> {

  readonly #entries: Map<string, ArrayBuffer>;

  private constructor(
    readonly directory: string,
    entries: Map<string, ArrayBuffer>,
  ) {
    this.#entries = entries;
  }

  static async create(path: string): Promise<StableResourceStore | null> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        return null;
      }

      const formData = await response.formData();

      const entries = new Map<string, ArrayBuffer>();


      await Promise.all([...formData.entries()]
        .map(async ([key, value]) => {
          if (value instanceof Blob) {
            entries.set(key.toLowerCase(), await value.arrayBuffer());
          }
        }));

      return new StableResourceStore(path, entries);
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
    key = key.toLowerCase();
    return this.#entries.get(key) ?? null;
  }

  getAvailableResources(): string[] {
    return [...this.#entries.keys()];
  }

  canLoad(key: string): boolean {
    key = key.toLowerCase();
    return this.#entries.has(key);
  }

  has(key: string): boolean {
    key = key.toLowerCase();
    return this.#entries.has(key);
  }

  dispose() {
    this.#entries.clear();
  }
}
