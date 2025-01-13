import type { AssetInfo } from '@osucad/multiplayer';
import type { BeatmapAsset } from './BeatmapAsset';
import { Action } from 'osucad-framework';

export abstract class BeatmapAssetManager {
  readonly added = new Action<BeatmapAsset>();

  readonly removed = new Action<BeatmapAsset>();

  readonly updated = new Action<BeatmapAsset>();

  readonly #assets = new Map<string, BeatmapAsset>();

  get assets(): BeatmapAsset[] {
    return [...this.#assets.values()];
  }

  getAsset(path: string) {
    return this.#assets.get(path) ?? null;
  }

  async load(assets: AssetInfo[]) {
    await Promise.all(assets.map(async (asset) => {
      const data = await this.loadAsset(asset);
      if (data) {
        this.#assets.set(asset.path, {
          path: asset.path,
          data,
        });
      }
    }));
  }

  protected abstract loadAsset(asset: AssetInfo): Promise<ArrayBuffer | null>;

  dispose() {
    // TODO
  }
}
