import type { IBeatmap, IResourcesProvider, SkinInfo } from '@osucad/common';
import type { IResourceStore } from 'osucad-framework';
import { SkinConfiguration, StableSkin } from '@osucad/common';

export class BeatmapSkin extends StableSkin {
  constructor(resources: IResourcesProvider, readonly beatmap: IBeatmap, resourceStore?: IResourceStore<ArrayBuffer>) {
    const skinInfo: SkinInfo = {
      name: `${beatmap.metadata.title} ${beatmap.metadata.artist}`,
      creator: beatmap.metadata.creator,
    };

    super(skinInfo, resources, resourceStore);

    this.configuration = new SkinConfiguration();
  }
}
