/* eslint-disable node/prefer-global/process */
import type nconf from 'nconf';

export interface IResources {
  dispose(): Promise<void>;
}

export interface IResourcesFactory<T extends IResources> {
  create(config: nconf.Provider): Promise<T>;
}

export interface IRunnerFactory<T> {
  create(resources: T): Promise<IRunner>;
}

export interface IRunner {
  start(): Promise<void>;

  stop(reason?: string, error?: any): Promise<void>;

  pause?(): Promise<void>;

  resume?(): Promise<void>;
}

export async function runService<T extends IResources>(
  resourceFactory: IResourcesFactory<T>,
  runnerFactory: IRunnerFactory<T>,
  config: nconf.Provider,
) {
  const resources = await resourceFactory.create(config);
  const runner = await runnerFactory.create(resources);

  const runningP = runner.start().catch(async (error) => {
    await runner.stop();

    throw error;
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, stopping...');
    runner.stop('sigterm');
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT signal, stopping...');
    runner.stop('sigint');
  });

  process.on('SIGQUIT', () => {
    console.log('Received SIGQUIT signal, stopping...');
    runner.stop('sigquit');
  });

  try {
    await runningP;
  }
  finally {
    await resources.dispose();
  }
}
