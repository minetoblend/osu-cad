import type { IResourcesFactory } from '@osucad-server/common';
import type { Provider } from 'nconf';
import { PlaceServerResources } from './PlaceServerResources';
import { BeatmapService } from './services/BeatmapService';

export class PlaceServerResourceFactory implements IResourcesFactory<PlaceServerResources> {
  async create(config: Provider): Promise<PlaceServerResources> {
    const beatmapService = await BeatmapService.create(config);

    return new PlaceServerResources(config, beatmapService);
  }
}
