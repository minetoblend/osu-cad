import fs from 'node:fs/promises';
import { join } from 'node:path';
import type { IResourceStore } from '../skinning/IResourceStore';

export class ElectronResourceStore implements IResourceStore<ArrayBuffer> {
  constructor(readonly path: string) {
  }

  async load(withContents: boolean = false) {
    await this.walk(this.path, withContents);
  }

  #availableResources: string[] = [];

  async walk(path: string, withContents: boolean, relative: string = '') {
    const dir = await fs.opendir(path);
    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        await this.walk(join(path, dirent.name), withContents, `${relative + dirent.name}/`);
      }
      else {
        this.#availableResources.push(join(relative, dirent.name));
        if (withContents) {
          try {
            const buffer = await fs.readFile(join(path, dirent.name));
            this.#resources.set(join(relative, dirent.name), buffer);
          }
          catch (e) {
            console.warn('Failed to load resource', join(relative, dirent.name));
            this.#resources.set(join(relative, dirent.name), null);
          }
        }
      }
    }
  }

  getAvailableResources(): string[] {
    return [...this.#availableResources];
  }

  #resources = new Map<string, ArrayBuffer | null>();

  get(name: string): ArrayBuffer | null {
    console.log('get', name);
    return this.#resources.get(name) ?? null;
  }

  canLoad(name: string): boolean {
    return this.#availableResources.includes(name);
  }

  async getAsync(name: string): Promise<ArrayBuffer | null> {
    console.log('get async', name);

    if (this.#resources.has(name)) {
      return this.#resources.get(name)!;
    }

    if (!this.has(name)) {
      return null;
    }

    try {
      const buffer = await fs.readFile(join(this.path, name));

      this.#resources.set(name, buffer);

      return buffer.buffer;
    }
    catch (e) {
      console.warn('Failed to load resource', name);

      this.#resources.set(name, null);

      return null;
    }
  }

  has(name: string): boolean {
    return this.#availableResources.includes(name);
  }

  dispose(): void {
  }
}
