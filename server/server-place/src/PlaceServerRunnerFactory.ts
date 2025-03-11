import type { IRunner, IRunnerFactory } from '@osucad-server/common';
import type { PlaceServerResources } from './PlaceServerResources';
import { PlaceServerRunner } from './PlaceServerRunner';

export class PlaceServerRunnerFactory implements IRunnerFactory<PlaceServerResources> {
  async create(resources: PlaceServerResources): Promise<IRunner> {
    const port = resources.config.get('server:port');

    return new PlaceServerRunner(
      resources.config,
      port,
    );
  }
}
