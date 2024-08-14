import type { BeatmapStore } from './BeatmapStore';

export abstract class EditorEnvironment {
  abstract createBeatmapStore(): BeatmapStore;
}
