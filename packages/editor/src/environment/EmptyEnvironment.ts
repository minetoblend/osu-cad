import { BeatmapStore } from './BeatmapStore';
import { EditorEnvironment } from './EditorEnvironment';
import { SkinStore } from './SkinStore';

export class EmptyEnvironment extends EditorEnvironment {
  async load(): Promise<void> {
  }

  readonly beatmaps = new class extends BeatmapStore {
  }();

  readonly skins = new class extends SkinStore {
  }();
}
