import type { IResourceStore } from '@osucad/framework';
import type { IFile } from './IFile';

export interface IFileStore extends IResourceStore<ArrayBuffer> {
  readonly files: ReadonlyArray<IFile>;

  getFile(filename: string): IFile | null;
}
