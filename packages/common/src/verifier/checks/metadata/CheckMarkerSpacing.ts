import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { GeneralCheck } from '../../GeneralCheck';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Metadata/CheckMarkerSpacing.cs
export class CheckMarkerSpacing extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Metadata',
      message: 'Incorrect marker spacing.',
      author: 'Naxess',
    };
  }

  override async* getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const refBeatmap = mapset.beatmaps[0];
    if (!refBeatmap)
      return;
  }
}
