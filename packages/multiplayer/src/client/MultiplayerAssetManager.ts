import type { AssetInfo } from '@osucad/multiplayer';
import { BeatmapAssetManager } from '@osucad/common';

export class MultiplayerAssetManager extends BeatmapAssetManager {
  override async load(assets: AssetInfo[]): Promise<void> {
    await Promise.all(assets.map(asset => this.loadAsset(asset)));
  }

  protected override async loadAsset(asset: AssetInfo): Promise<ArrayBuffer | null> {
    try {
      return await fetch(`http://localhost:3000/assets/${asset.id}`).then(it => it.arrayBuffer());
    }
    catch (e) {}
    return null;
  }
}
