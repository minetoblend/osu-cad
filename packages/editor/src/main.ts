import 'reflect-metadata'
import { WebGameHost } from 'osucad-framework';
import { PlaygroundGame } from './playground/PlaygroundGame';
import './style.css';

async function main() {
  const host = new WebGameHost('osucad', {
    friendlyGameName: 'osucad',
  });

  await host.run(new PlaygroundGame());
}

main();
