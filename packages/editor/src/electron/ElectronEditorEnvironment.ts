import { EditorEnvironment } from '../environment/EditorEnvironment';
import type { BeatmapStore } from '../environment/BeatmapStore';
import type { SkinStore } from '../environment/SkinStore';
import { ElectronBeatmapStore } from './ElectronBeatmapStore';
import { ElectronSkinStore } from './ElectronSkinStore';
import { StablePaths } from './StablePaths';

export class ElectronEditorEnvironment extends EditorEnvironment {
  #paths = new StablePaths();

  async load() {
    await this.#paths.load();
    console.log(this.#paths.osuInstallPath, this.#paths.osuDBPath);
  }

  createBeatmapStore(): BeatmapStore {
    const store = new ElectronBeatmapStore(this.#paths);
    store.init();

    return store;
  }

  createSkinStore(): SkinStore {
    return new ElectronSkinStore(this.#paths.skinsPath!);
  }
}
