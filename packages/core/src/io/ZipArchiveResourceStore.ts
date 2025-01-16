import type { IResourceStore } from '@osucad/framework';
import type { ZipEntry } from 'unzipit';
import { unzip } from 'unzipit';

export class ZipArchiveResourceStore implements IResourceStore<ArrayBuffer> {
  #entries = new Map<string, ZipEntry>();
  #loadedEntries = new Map<string, ArrayBuffer>();
  #loadPromises = new Map<string, Promise<ArrayBuffer | null>>();

  private constructor(entries: { [key: string]: ZipEntry }) {
    this.#entries = new Map(Object.entries(entries));
  }

  async loadAll() {
    await Promise.all([...this.#entries.keys()].map(key => this.getAsync(key)));
  }

  static async create(buffer: ArrayBuffer) {
    const { entries } = await unzip(buffer);

    return new ZipArchiveResourceStore(entries);
  }

  has(name: string): boolean {
    return this.#loadedEntries.has(name);
  }

  get(name: string): ArrayBuffer | null {
    return this.#loadedEntries.get(name) || null;
  }

  async getAsync(name: string): Promise<ArrayBuffer | null> {
    const data = this.get(name);

    if (data != null)
      return data;

    let loadP = this.#loadPromises.get(name);

    if (loadP)
      return loadP;

    this.#loadPromises.set(name, loadP = this.#load(name));

    return loadP;
  }

  async #load(name: string): Promise<ArrayBuffer | null> {
    const entry = this.#entries.get(name);
    if (!entry || entry.isDirectory)
      return null;

    try {
      const data = await entry.arrayBuffer();
      this.#loadedEntries.set(name, data);
      return data;
    }
    catch (e) {
      console.warn('Failed to unzip entry', e);
      return null;
    }
  }

  getAvailableResources(): string[] {
    return [...this.#entries.keys()];
  }

  canLoad(name: string): boolean {
    return this.#entries.has(name) && !this.#entries.get(name)!.isDirectory;
  }

  dispose() {
  }
}
