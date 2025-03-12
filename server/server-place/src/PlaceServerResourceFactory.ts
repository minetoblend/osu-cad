import type { IResourcesFactory } from '@osucad-server/common';
import type { Provider } from 'nconf';
import { createDatasource } from './datasource';
import { PlaceServerResources } from './PlaceServerResources';
import { BeatmapService } from './services/BeatmapService';
import { UserService } from './services/UserService';

export class PlaceServerResourceFactory implements IResourcesFactory<PlaceServerResources> {
  async create(config: Provider): Promise<PlaceServerResources> {
    const db = await createDatasource(config);

    const beatmapService = new BeatmapService(db);
    const userService = new UserService(config, db);

    await beatmapService.init(config);

    return new PlaceServerResources(config, beatmapService, userService);
  }
}
