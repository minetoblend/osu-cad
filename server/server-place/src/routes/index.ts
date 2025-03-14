import type { Router } from 'express';
import type { Provider } from 'nconf';
import type { PlaceServerResources } from '../PlaceServerResources';
import SSE from 'express-sse';
import * as auth from './auth';
import * as beatmap from './beatmap';
import * as chat from './chat';
import * as place from './place';
import * as users from './users';

export interface IRoutes {
  auth: Router;
  users: Router;
  beatmap: Router;
  place: Router;
  chat: Router;
  sse: SSE;
}

export function create(
  config: Provider,
  resources: PlaceServerResources,
): IRoutes {
  const sse = new SSE();

  return {
    auth: auth.create(config),
    users: users.create(config, resources),
    beatmap: beatmap.create(config, resources),
    place: place.create(config, sse, resources),
    chat: chat.create(config, sse, resources),
    sse,
  };
}
