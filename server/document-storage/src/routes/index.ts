import type { Router } from 'express';
import type { Provider } from 'nconf';
import * as blobs from './blobs';

export interface IRoutes {
  blobs: Router;
}

export function create(config: Provider): IRoutes {
  return {
    blobs: blobs.create(config),
  };
}
