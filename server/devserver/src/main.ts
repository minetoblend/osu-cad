import { join } from 'node:path';
import { runService } from '@osucad-server/common';
import nconf from 'nconf';
import { DevServerResourceFactory } from './DevServerResourceFactory';
import { DevServerRunnerFactory } from './DevServerRunnerFactory';

nconf.argv()
  .env()
  .file({ file: join(import.meta.dirname, '../config.json') });

runService(
  new DevServerResourceFactory(),
  new DevServerRunnerFactory(),
  nconf,
);
