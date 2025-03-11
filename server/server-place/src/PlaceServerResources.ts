import type { IResources } from '@osucad-server/common';
import type { Provider } from 'nconf';
import type { BeatmapService } from 'server/server-place/src/services/BeatmapService';

export class PlaceServerResources implements IResources {
  constructor(
    readonly config: Provider,
    readonly beatmapService: BeatmapService,
  ) {}

  async dispose() {}
}
