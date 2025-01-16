import type { IFile } from './IFile';
import { FileStore } from './FileStore';

export class StaticFileStore extends FileStore {
  constructor(
    override readonly files: ReadonlyArray<IFile>,
  ) {
    super();
  }
}
