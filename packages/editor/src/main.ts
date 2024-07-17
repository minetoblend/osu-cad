import { WebGameHost } from 'osucad-framework';

import './style.css';
import { OsucadGame } from './OsucadGame';

async function main() {
  const host = new WebGameHost('osucad', {
    friendlyGameName: 'osucad',
  });

  await host.run(new OsucadGame());
}

main();
