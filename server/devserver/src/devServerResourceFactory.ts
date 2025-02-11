import type { IResourcesFactory } from '@osucad-server/common';
import type { Provider } from 'nconf';
import { Resources } from './resources';
import { GitService } from './services/GitService';
import { InMemoryDocumentStorage } from './services/InMemoryDocumentStorage';

export class DevServerResourceFactory implements IResourcesFactory<Resources> {
  async create(config: Provider): Promise<Resources> {
    const git = new GitService(config);
    const storage = new InMemoryDocumentStorage();

    return new Resources(config, git, storage);
  }
}
