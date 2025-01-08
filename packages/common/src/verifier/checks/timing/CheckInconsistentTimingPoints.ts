import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { almostEquals } from 'osucad-framework';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

export class CheckInconsistentTimingPoints extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Timing',
      message: 'Inconsistent timing points, meter signatures, or BPM.',
      author: 'Naxess',
    };
  }

  override templates = {

    'Missing':
  new IssueTemplate('problem', '{0:timestamp} Missing uninherited line, see {1:beatmap}.', 'timestamp - ', 'difficulty').withCause('A beatmap does not have an uninherited line which the reference beatmap does, or visa versa.'),

    'Missing Minor':
    new IssueTemplate('minor', '{0:timestamp} Has a decimally different offset to the one in {1:beatmap}.', 'timestamp - ', 'difficulty').withCause('Same as the first check, except includes issues caused by decimal unsnaps of uninherited lines.'),

    'Inconsistent Meter':
    new IssueTemplate('problem', '{0:timestamp} Inconsistent meter signature, see {1:beatmap}.', 'timestamp - ', 'difficulty').withCause('The meter signature of an uninherited timing line is different from the reference beatmap.'),

    'Inconsistent BPM':
    new IssueTemplate('problem', '{0:timestamp} Inconsistent BPM, see {1:beatmap}.', 'timestamp - ', 'difficulty').withCause('Same as the meter check, except checks BPM instead.'),

  };

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const refBeatmap = mapset.beatmaps[0];
    if (!refBeatmap)
      return;

    for (const beatmap of mapset.beatmaps) {
      for (const timingPoint of refBeatmap.controlPoints.timingPoints) {
        const other = beatmap.controlPoints.timingPoints.find(it => Math.round(it.time) === Math.round(timingPoint.time));

        if (!other) {
          yield this.createIssue(this.templates.Missing, beatmap, timingPoint.time, refBeatmap.beatmapInfo.difficultyName);

          return;
        }
        else {
          if (other.meter !== timingPoint.meter)
            yield this.createIssue(this.templates['Inconsistent Meter'], beatmap, timingPoint.time, refBeatmap.beatmapInfo.difficultyName);
          if (other.beatLength !== timingPoint.beatLength)
            yield this.createIssue(this.templates['Inconsistent BPM'], beatmap, timingPoint.time, refBeatmap.beatmapInfo.difficultyName);

          const respectiveLineExact = beatmap.controlPoints.timingPoints.find(other => almostEquals(other.time, timingPoint.time));

          if (respectiveLineExact === null)
            yield this.createIssue(this.templates['Missing Minor'], beatmap, timingPoint.time, refBeatmap.beatmapInfo.difficultyName);
        }
      }

      // Check the other way around as well, to make sure the reference map has all uninherited lines this map has.
      for (const timingPoint of beatmap.controlPoints.timingPoints) {
        const other = refBeatmap.controlPoints.timingPoints.find(it => Math.round(it.time) === Math.round(timingPoint.time));

        if (!other) {
          yield this.createIssue(this.templates.Missing, refBeatmap, timingPoint.time, beatmap.beatmapInfo.difficultyName);

          return;
        }
        else {
          const respectiveLineExact = refBeatmap.controlPoints.timingPoints.find(other => almostEquals(other.time, timingPoint.time));

          if (respectiveLineExact === null)
            yield this.createIssue(this.templates['Missing Minor'], refBeatmap, timingPoint.time, beatmap.beatmapInfo.difficultyName);
        }
      }
    }
  }
}
