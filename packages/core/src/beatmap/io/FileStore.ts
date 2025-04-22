import type { IResourceStore } from '@osucad/framework';
import type { IFile } from './IFile';
import type { IFileStore } from './IFileStore';

export abstract class FileStore implements IFileStore, IResourceStore<ArrayBuffer> {
  abstract readonly files: ReadonlyArray<IFile>;

  getFile(filename: string): IFile | null {
    filename = filename.toLowerCase();

    return this.files.find(it => it.name.toLowerCase() === filename) ?? null;
  }

  has(name: string): boolean {
    return !!this.getFile(name)?.getDataSync();
  }

  get(name: string): ArrayBuffer | null {
    return this.getFile(name)?.getDataSync() ?? null;
  }

  async getAsync(name: string): Promise<ArrayBuffer | null> {
    return (await this.getFile(name)?.getData()) ?? null;
  }

  getAvailableResources(): string[] {
    return this.files.map(it => it.name);
  }

  canLoad(name: string): boolean {
    return this.has(name);
  }

  dispose(): void {
    for (const file of this.files)
      file.dispose();
  }
}
