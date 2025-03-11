import { join } from 'node:path';
import { runService } from '@osucad-server/common';
import nconf from 'nconf';
import { PlaceServerResourceFactory } from './PlaceServerResourceFactory';
import { PlaceServerRunnerFactory } from './PlaceServerRunnerFactory';

nconf.argv()
  .env()
  .file({ file: join(import.meta.dirname, '../config.json') });

runService(
  new PlaceServerResourceFactory(),
  new PlaceServerRunnerFactory(),
  nconf,
);
