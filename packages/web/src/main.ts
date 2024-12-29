import { WebGameHost } from 'osucad-framework';
import { OsucadWebGame } from './OsucadWebGame';

const host = new WebGameHost('osucad', { friendlyGameName: 'osucad' });

const game = new OsucadWebGame();

addEventListener('DOMContentLoaded', () => host.run(game));
