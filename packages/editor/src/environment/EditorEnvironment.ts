import type { BeatmapStore } from './BeatmapStore';
import type { SkinStore } from './SkinStore';

export abstract class EditorEnvironment {
  abstract load(): Promise<void>;

  abstract createBeatmapStore(): BeatmapStore;

  abstract createSkinStore(): SkinStore;
}
