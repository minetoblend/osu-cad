import { WebGameHost } from 'osucad-framework';
import { BeatmapViewerGame } from './BeatmapViewerGame';

const host = new WebGameHost('osucad', { friendlyGameName: 'osucad' });

const game = new BeatmapViewerGame();

addEventListener('DOMContentLoaded', () => host.run(game));
