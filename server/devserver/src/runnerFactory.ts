import type { IRunner, IRunnerFactory } from '@osucad-server/common';
import type { Resources } from './resources';
import { Runner } from './runner';

export class RunnerFactory implements IRunnerFactory<Resources> {
  async create(resources: Resources): Promise<IRunner> {
    const port = resources.config.get('server:port');

    return new Runner(
      resources.config,
      port,
      resources.storage,
      resources.git,
    );
  }
}
