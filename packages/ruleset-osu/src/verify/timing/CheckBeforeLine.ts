import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import { BeatmapCheck, IssueTemplate } from '@osucad/core';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Timing/CheckBeforeLine.cs
export class CheckBeforeLine extends BeatmapCheck<any> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Timing',
      message: 'Hit object is unaffected by a line very close to it.',
      author: 'Naxess',
    };
  }

  override templates = {
    before: new IssueTemplate('warning', '{0:timestamp} {1} is snapped {2:##?} ms before a line which would modify its slider velocity.', 'timestamp - ', 'object', 'unsnap').withCause('A hit object is snapped 5 ms or less behind a timing line which would otherwise modify its slider velocity. ' + 'For standard and catch this only looks at slider heads.'),
    after: new IssueTemplate('warning', '{0:timestamp} {1} is snapped {2:##?} ms after a line which would modify its slider velocity.', 'timestamp - ', 'object', 'unsnap').withCause('Same as the other check, except after instead of before. Only applies to taiko.'),
  };

  override async *getIssues(beatmap: VerifierBeatmap<any>): AsyncGenerator<Issue, void, undefined> {
    for (const hitObject of beatmap.hitObjects) {
      const type = hitObject instanceof HitCircle
        ? 'Circle'
        : hitObject instanceof Slider
          ? 'Slider head'
          : 'Spinner';

      yield * this.getIssue(type, hitObject.startTime, beatmap);
    }
  }

  * getIssue(type: string, time: number, beatmap: VerifierBeatmap) {
    const unsnap = beatmap.getPracticalUnsnap(time);

    const curLine = beatmap.controlPoints.timingPointAt(time);
    const nextLine = beatmap.controlPoints.nextTimingPointAfter(time);

    if (nextLine === null)
      return;

    const curEffectiveBPM = beatmap.controlPoints.difficultyPointAt(curLine.time).sliderVelocity * curLine.bpm;
    const nextEffectiveBPM = beatmap.controlPoints.difficultyPointAt(nextLine.time).sliderVelocity * nextLine.bpm;

    const deltaEffectiveBPM = curEffectiveBPM - nextEffectiveBPM;

    const timeDiff = nextLine.time - time;

    if (timeDiff > 0 && timeDiff <= 5 && Math.abs(unsnap) <= 1 && Math.abs(deltaEffectiveBPM) > 1)
      yield this.createIssue(this.templates.before, beatmap, time, type, timeDiff);
  }
}
