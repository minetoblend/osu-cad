import { join } from 'node:path';
import { runService } from '@osucad-server/common';
import nconf from 'nconf';
import { ResourceFactory } from './resourceFactory';
import { RunnerFactory } from './runnerFactory';

nconf.argv()
  .env()
  .file({ file: join(import.meta.dirname, '../config.json') });

runService(
  new ResourceFactory(),
  new RunnerFactory(),
  nconf,
);
