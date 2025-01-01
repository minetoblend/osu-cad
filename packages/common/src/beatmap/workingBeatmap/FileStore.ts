import type { IFile } from './IFile';
import type { IFileStore } from './IFileStore';

export abstract class FileStore implements IFileStore {
  abstract readonly files: ReadonlyArray<IFile>;

  getFile(filename: string): IFile | null {
    return this.files.find(it => it.name === filename) ?? null;
  }
}
