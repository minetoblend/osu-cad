import type { Issue } from 'packages/common/src/verifier/Issue';
import type { VerifierBeatmap } from 'packages/common/src/verifier/VerifierBeatmap';
import type { ControlPoint } from '../../../../controlPoints/ControlPoint';
import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { almostEquals } from 'osucad-framework';
import { zipWithNext } from '../../../../utils/arrayUtils';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Timing/CheckConcurrentLines.cs
export class CheckConcurrentControlPoints extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Timing',
      message: 'Concurrent or conflicting timing lines.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing issues with concurrent lines of the same type, such as them switching order when loading the beatmap.
              <image>
                  https://i.imgur.com/whTV4aV.png
                  Two inherited lines which were originally the other way around, but swapped places when opening the beatmap again.
              </image>
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Depending on how the game loads the lines, they may be loaded in the wrong order causing certain effects to disappear,
              like the editor to not see that kiai is enabled where it is in gameplay. This coupled with the fact that future versions
              of the game may change how these behave make them highly unreliable.
              <note>
                  Two lines of different types, however, work properly as inherited and uninherited lines are handeled seperately,
                  where the inherited will always apply its effects last.
              </note>
          `),
        },
      ],
    };
  }

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const list of beatmap.controlPoints.controlPointLists) {
      for (const [current, next] of zipWithNext(list.items as ControlPoint[])) {
        if (!almostEquals(current.time, next.time))
          continue;

        yield this.createIssue({
          level: 'problem',
          message: `Concurrent ${current.controlPointName}s.`,
          beatmap,
          timestamp: current.time,
          cause: `Two ${current.controlPointName}s of the same type exist at the same point in time.`,
        });
      }
    }
  }
}
