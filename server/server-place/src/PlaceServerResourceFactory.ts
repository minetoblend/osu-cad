import type { IResourcesFactory } from '@osucad-server/common';
import type { Provider } from 'nconf';
import { PlaceServerResources } from './PlaceServerResources';

export class PlaceServerResourceFactory implements IResourcesFactory<PlaceServerResources> {
  async create(config: Provider): Promise<PlaceServerResources> {
    return new PlaceServerResources(config);
  }
}
