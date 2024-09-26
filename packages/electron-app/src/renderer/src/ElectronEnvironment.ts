import { EditorEnvironment } from '@osucad/editor';
import { StableBeatmapStore } from './StableBeatmapStore';
import { ElectronSkinStore } from './ElectronSkinStore';

export class ElectronEnvironment extends EditorEnvironment {
  readonly beatmaps = new StableBeatmapStore();

  readonly skins = new ElectronSkinStore();

  async load(): Promise<void> {
    await Promise.all([
      this.beatmaps.load(),
      this.skins.load(),
    ]);

  }
}
