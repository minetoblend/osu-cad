import { OsucadGame, WebGameHost } from '../../../../editor/src';
import '../assets/main.css';
import { ElectronEnvironment } from './ElectronEnvironment.ts';


const environment = new ElectronEnvironment();

const game = new OsucadGame(environment);

const host = new WebGameHost('osucad', {
  friendlyGameName: 'osucad',
});

host.run(game);
