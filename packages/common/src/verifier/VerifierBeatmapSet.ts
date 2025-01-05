import type { Sample } from 'osucad-framework';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { HitSample } from '../hitsounds/HitSample';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { BeatmapSkin } from '../skinning/BeatmapSkin';
import { OsuHitObject } from '../rulesets/osu/hitObjects/OsuHitObject';

export class VerifierBeatmapSet {
  constructor(
    readonly beatmaps: readonly IBeatmap<any>[],
    readonly fileStore: FileStore,
    readonly skin: BeatmapSkin,
    readonly resourcesProvider: IResourcesProvider,
  ) {
  }

  getAudioPath() {
    return this.beatmaps.find(it => it.settings.audioFileName.length > 0)?.settings.audioFileName ?? null;
  }

  getAllUsedHitSoundSamples() {
    const allSamples = new Set<string | null>();
    const samples: {
      sample: Sample;
      sampleInfo: HitSample;
      beatmap: IBeatmap<any>;
    }[] = [];

    const channel = this.resourcesProvider.mixer.hitsounds;

    for (const beatmap of this.beatmaps) {
      for (const hitObject of beatmap.hitObjects) {
        if (!(hitObject instanceof OsuHitObject))
          continue;

        for (const sampleInfo of hitObject.hitSamples) {
          const sample = this.skin.getSample(channel, sampleInfo);
          if (sample && !allSamples.has(sampleInfo.sampleName)) {
            allSamples.add(sampleInfo.sampleName);
            samples.push({
              sampleInfo,
              sample,
              beatmap,
            });
          }
        }
      }
    }

    return samples;
  }
}
