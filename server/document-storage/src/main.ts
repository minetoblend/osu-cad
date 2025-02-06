import { join } from 'node:path';
import config from 'nconf';
import { create as createApp } from './app';

config.argv()
  .env()
  .file({ file: join(import.meta.dirname, '../config.json') });

const app = createApp(config);

const port = config.get('server:port');

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
