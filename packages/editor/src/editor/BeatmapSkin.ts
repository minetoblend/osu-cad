import type { EditorBeatmap, IResourcesProvider, SkinInfo } from '@osucad/common';
import { SkinConfiguration, StableSkin } from '@osucad/common';

export class BeatmapSkin extends StableSkin {
  constructor(resources: IResourcesProvider, readonly beatmap: EditorBeatmap) {
    const skinInfo: SkinInfo = {
      name: `${beatmap.metadata.title} ${beatmap.metadata.artist}`,
      creator: beatmap.metadata.creator,
    };

    super(skinInfo, resources, beatmap.fileStore);

    this.configuration = new SkinConfiguration();
  }
}
