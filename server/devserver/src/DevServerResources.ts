import type { IDocumentStorage } from '@osucad/multiplayer';
import type { IResources } from '@osucad-server/common';
import type { Provider } from 'nconf';
import type { GitService } from './services/GitService';

export class DevServerResources implements IResources {
  constructor(
    readonly config: Provider,
    readonly git: GitService,
    readonly storage: IDocumentStorage,
  ) {}

  async dispose() {}
}
