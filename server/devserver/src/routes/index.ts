import type { IDocumentStorage } from '@osucad/multiplayer';
import type { Router } from 'express';
import type { Provider } from 'nconf';
import type { GitService } from '../services/GitService';
import * as blobs from './git/blobs';
import * as commits from './git/commits';
import * as trees from './git/trees';
import * as storage from './storage';

export interface IRoutes {
  storage: Router;
  git: {
    blobs: Router;
    trees: Router;
    commits: Router;
  };
}

export function create(
  config: Provider,
  documentStorage: IDocumentStorage,
  git: GitService,
): IRoutes {
  return {
    storage: storage.create(documentStorage),
    git: {
      blobs: blobs.create(git),
      trees: trees.create(config),
      commits: commits.create(config),
    },
  };
}
