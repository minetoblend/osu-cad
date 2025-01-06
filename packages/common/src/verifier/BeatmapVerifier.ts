import type { FileStore } from '../beatmap/io/FileStore';
import type { HitObject } from '../hitObjects/HitObject';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { BeatmapSkin } from '../skinning/BeatmapSkin';
import type { BeatmapCheck } from './BeatmapCheck';
import type { GeneralCheck } from './GeneralCheck';
import type { Issue } from './Issue';
import type { VerifierBeatmap } from './VerifierBeatmap';
import { Component } from 'osucad-framework';
import { VerifierBeatmapSet } from './VerifierBeatmapSet';

export abstract class BeatmapVerifier<T extends HitObject = HitObject> extends Component {
  abstract get beatmapChecks(): BeatmapCheck<T>[];

  abstract get generalChecks(): GeneralCheck[];

  async * getIssues(
    beatmaps: readonly VerifierBeatmap<any>[],
    fileStore: FileStore,
    skin: BeatmapSkin,
    resources: IResourcesProvider,
  ): AsyncGenerator<Issue, void, undefined> {
    for (const beatmap of beatmaps) {
      for (const check of this.beatmapChecks) {
        this.loadComponent(check);

        const supportedDifficulties = check.metadata.difficulties;
        if (supportedDifficulties && !supportedDifficulties.includes(beatmap.getDifficulty(true)!))
          continue;

        yield * check.getIssues(beatmap);
      }
    }

    await skin.load();

    const beatmapSet = new VerifierBeatmapSet(beatmaps, fileStore, skin, resources);

    for (const check of this.generalChecks) {
      this.loadComponent(check);
      yield * check.getIssues(beatmapSet);
    }
  }
}
