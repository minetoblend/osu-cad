import type { IBeatmap } from '@osucad/common';
import { BeatmapStore } from './BeatmapStore';
import { EditorEnvironment } from './EditorEnvironment';
import { SkinStore } from './SkinStore';

export class EmptyEnvironment extends EditorEnvironment {
  async load(): Promise<void> {
  }

  readonly beatmaps = new class extends BeatmapStore {
    save(id: string, beatmap: IBeatmap): Promise<boolean> {
      return Promise.resolve(false);
    }
  }();

  readonly skins = new class extends SkinStore {
  }();
}
