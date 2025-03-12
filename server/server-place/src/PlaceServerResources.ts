import type { IResources } from '@osucad-server/common';
import type { Provider } from 'nconf';
import type { BeatmapService } from 'server/server-place/src/services/BeatmapService';
import type { UserService } from './services/UserService';

export class PlaceServerResources implements IResources {
  constructor(
    readonly config: Provider,
    readonly beatmapService: BeatmapService,
    readonly userService: UserService,
  ) {}

  async dispose() {}
}
