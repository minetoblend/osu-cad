import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmap } from '../../VerifierBeatmap';
import { TimingPoint } from '../../../controlPoints/TimingPoint';
import { minBy } from '../../../utils/arrayUtils';
import { BeatmapCheck } from '../../BeatmapCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

export class CheckFirstLine extends BeatmapCheck<any> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Timing',
      message: 'First line toggles kiai or is inherited.',
      author: 'Naxess',
    };
  }

  override templates = {
    inherited: new IssueTemplate('problem', '{0:timestamp} First timing line is inherited.', 'timestamp - ').withCause('The first timing line of a beatmap is inherited.'),
    togglesKiai: new IssueTemplate('problem', '{0:timestamp} First timing line toggles kiai.', 'timestamp - ').withCause('The first timing line of a beatmap has kiai enabled.'),
    noLines: new IssueTemplate('problem', 'There are no timing lines.').withCause('A beatmap has no timing lines.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<any>): AsyncGenerator<Issue, void, undefined> {
    const firstTimingPoint = beatmap.controlPoints.timingPoints.first;
    if (!firstTimingPoint) {
      yield this.createIssue(this.templates.noLines, beatmap);
      return;
    }

    const firstControlPoint = minBy(beatmap.controlPoints.allControlPoints, it => it.time);

    if (!(firstControlPoint instanceof TimingPoint) && firstControlPoint.time < firstTimingPoint.time)
      yield this.createIssue(this.templates.inherited, beatmap, firstControlPoint.time);

    if (beatmap.controlPoints.effectPointAt(firstTimingPoint.time).kiaiMode)
      yield this.createIssue(this.templates.togglesKiai, beatmap, firstControlPoint.time);
  }
}
