import { join } from 'node:path';
import { runService } from '@osucad-server/common';
import nconf from 'nconf';
import { DevServerResourceFactory } from './devServerResourceFactory';
import { DevServerRunnerFactory } from './devServerRunnerFactory';

nconf.argv()
  .env()
  .file({ file: join(import.meta.dirname, '../config.json') });

runService(
  new DevServerResourceFactory(),
  new DevServerRunnerFactory(),
  nconf,
);
