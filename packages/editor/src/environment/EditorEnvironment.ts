import type { BeatmapStore } from './BeatmapStore';
import type { SkinStore } from './SkinStore';

export abstract class EditorEnvironment {
  abstract load(): Promise<void>;

  abstract readonly beatmaps: BeatmapStore;

  abstract readonly skins: SkinStore;
}
