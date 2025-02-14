import type { IResourcesFactory } from '@osucad-server/common';
import type { Provider } from 'nconf';
import { DevServerResources } from './DevServerResources';
import { GitService } from './services/GitService';
import { InMemoryDocumentStorage } from './services/InMemoryDocumentStorage';

export class DevServerResourceFactory implements IResourcesFactory<DevServerResources> {
  async create(config: Provider): Promise<DevServerResources> {
    const git = new GitService(config);
    const storage = new InMemoryDocumentStorage();

    return new DevServerResources(config, git, storage);
  }
}
