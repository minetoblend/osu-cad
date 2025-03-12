import type { Router } from 'express';
import type { Provider } from 'nconf';
import type { PlaceServerResources } from '../PlaceServerResources';
import * as auth from './auth';
import * as beatmap from './beatmap';
import * as place from './place';
import * as users from './users';

export interface IRoutes {
  auth: Router;
  users: Router;
  beatmap: Router;
  place: Router;
}

export function create(
  config: Provider,
  resources: PlaceServerResources,
): IRoutes {
  return {
    auth: auth.create(config),
    users: users.create(config, resources),
    beatmap: beatmap.create(config, resources),
    place: place.create(config, resources),
  };
}
