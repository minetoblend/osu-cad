import { join } from 'node:path';
import nconf from 'nconf';
import { create as createApp } from './app';

nconf.argv()
  .env()
  .file({ file: join(import.meta.dirname, '../config.json') });

const app = createApp(nconf);

const port = nconf.get('server:port');

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
