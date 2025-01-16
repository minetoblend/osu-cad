import type { IResourceStore } from '@osucad/framework';
import type { IFile } from './IFile';
import { FileStore } from './FileStore';
import { SimpleFile } from './SimpleFile';

export class ResourceStoreBackedFileStore extends FileStore {
  constructor(resourceStore: IResourceStore<ArrayBuffer>) {
    super();

    this.files = resourceStore.getAvailableResources().map(filename =>
      new SimpleFile(filename, async () => (await resourceStore.getAsync(filename))!),
    );
  }

  readonly files: ReadonlyArray<IFile>;
}
