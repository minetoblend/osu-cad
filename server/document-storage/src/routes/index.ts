import type { Router } from 'express';
import type { Provider } from 'nconf';
import * as blobs from './blobs';
import * as commits from './commits';
import * as trees from './trees';

export interface IRoutes {
  blobs: Router;
  trees: Router;
  commits: Router;
}

export function create(config: Provider): IRoutes {
  return {
    blobs: blobs.create(config),
    trees: trees.create(config),
    commits: commits.create(config),
  };
}
