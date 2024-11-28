import type { AssetInfo } from '../../../multiplayer/src/protocol/ServerMessage';
import type { BeatmapAsset } from './BeatmapAsset';
import { Action } from 'osucad-framework';

export class BeatmapAssetManager {
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
    // TODO
  }
}
