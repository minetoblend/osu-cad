import type { IFile } from './IFile';

export interface IFileStore {
  readonly files: ReadonlyArray<IFile>;

  getFile(filename: string): IFile | null;
}
