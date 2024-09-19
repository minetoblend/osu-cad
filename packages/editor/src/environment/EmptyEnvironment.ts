import { BeatmapStore } from './BeatmapStore.ts';
import { EditorEnvironment } from './EditorEnvironment.ts';
import { SkinStore } from './SkinStore.ts';

export class EmptyEnvironment extends EditorEnvironment {
  async load(): Promise<void> {
  }

  readonly beatmaps = new class extends BeatmapStore {
  }();

  readonly skins = new class extends SkinStore {
  }();
}
