import type { IResourceStore } from '@osucad/framework';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { SkinConfigurationLookup } from './SkinConfigurationLookup';
import type { SkinInfo } from './SkinInfo';
import { SkinComboColorLookup } from './SkinComboColorLookup';
import { SkinConfiguration } from './SkinConfiguration';
import { StableSkin } from './stable/StableSkin';

export class BeatmapSkin extends StableSkin {
  constructor(resources: IResourcesProvider, readonly beatmap: IBeatmap, resourceStore?: IResourceStore<ArrayBuffer>) {
    const skinInfo: SkinInfo = {
      name: `${beatmap.metadata.title} ${beatmap.metadata.artist}`,
      creator: beatmap.metadata.creator,
    };

    super(skinInfo, resources, resourceStore);

    this.configuration = new SkinConfiguration();
  }

  override getConfig<T>(lookup: SkinConfigurationLookup<T>): T | null {
    if (lookup instanceof SkinComboColorLookup) {
      return this.getComboColor(this.beatmap.colors, lookup.colorIndex, lookup.combo) as any;
    }

    return super.getConfig(lookup);
  }
}
