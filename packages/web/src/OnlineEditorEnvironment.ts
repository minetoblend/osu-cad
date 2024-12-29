import type { IBeatmap } from '@osucad/editor';
import { BeatmapStore, EditorEnvironment, SkinStore } from '@osucad/editor';

export class OnlineEditorEnvironment extends EditorEnvironment {
  async load(): Promise<void> {
  }

  beatmaps: BeatmapStore = new OnlineBeatmapStore();
  skins: SkinStore = new OnlineSkinStore();
}

class OnlineBeatmapStore extends BeatmapStore {
  async save(id: string, beatmap: IBeatmap): Promise<boolean> {
    return false;
  }
}

class OnlineSkinStore extends SkinStore {
}
