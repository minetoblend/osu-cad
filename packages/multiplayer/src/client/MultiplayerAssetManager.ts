import type { AssetInfo } from '@osucad/multiplayer';
import { BeatmapAssetManager } from '@osucad/common';

export class MultiplayerAssetManager extends BeatmapAssetManager {
  protected override async loadAsset(asset: AssetInfo): Promise<ArrayBuffer | null> {
    try {
      return await fetch(`http://localhost:3000/assets/${asset.id}`).then(it => it.arrayBuffer());
    }
    catch (e) {}
    return null;
  }
}
