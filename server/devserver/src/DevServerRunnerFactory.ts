import type { IRunner, IRunnerFactory } from '@osucad-server/common';
import type { DevServerResources } from './DevServerResources';
import { DevServerRunner } from './DevServerRunner';

export class DevServerRunnerFactory implements IRunnerFactory<DevServerResources> {
  async create(resources: DevServerResources): Promise<IRunner> {
    const port = resources.config.get('server:port');

    return new DevServerRunner(
      resources.config,
      port,
      resources.storage,
      resources.git,
    );
  }
}
