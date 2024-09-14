import { EditorEnvironment } from '@osucad/editor';
import { StableBeatmapStore } from './StableBeatmapStore.ts';
import { ElectronSkinStore } from './ElectronSkinStore.ts';

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
