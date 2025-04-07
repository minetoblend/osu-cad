import { WebGameHost } from '@osucad/framework';
import { BeatmapViewerGame } from './BeatmapViewerGame';
import './sentry';
import './posthog';

const host = new WebGameHost('osucad', { friendlyGameName: 'osucad' });

const game = new BeatmapViewerGame();

addEventListener('DOMContentLoaded', () => host.run(game));
