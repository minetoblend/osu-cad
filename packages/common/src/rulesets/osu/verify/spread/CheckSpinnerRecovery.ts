import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { IssueTemplate } from '../../../../verifier/template/IssueTemplate';
import { Spinner } from '../../hitObjects/Spinner';

const expectedMultiplier = 4 / 3;

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckSpinnerRecovery.cs
export class CheckSpinnerRecovery extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Spread',
      message: 'Too short spinner time or spinner recovery time.',
      author: 'Naxess',
    };
  }

  override templates = {
    'Problem Length': new IssueTemplate('problem', '{0} Spinner length is too short ({1} ms, expected {2}).', 'timestamp - ', 'duration', 'duration').withCause('A spinner is shorter than 4, 3 or 2 beats for Easy, Normal and Hard respectively, assuming 240 bpm.'),
    'Warning Length': new IssueTemplate('warning', '{0} Spinner length is probably too short ({1} ms, expected {2}).', 'timestamp - ', 'duration', 'duration').withCause('Same as the first check, except 20% more lenient, implying that 200 bpm is assumed instead.'),
    'Problem Recovery': new IssueTemplate('problem', '{0} Spinner recovery time is too short ({1} ms, expected {2}).', 'timestamp - ', 'duration', 'duration').withCause('The time after a spinner ends to the next object is shorter than 4, 3 or 2 beats for Easy, Normal and Hard respectively, ' + 'assuming 240 bpm, where both the non-scaled and bpm-scaled thresholds must be exceeded.'),
    'Warning Recovery': new IssueTemplate('warning', '{0} Spinner recovery time is probably too short ({1} ms, expected {2}).', 'timestamp - ', 'duration', 'duration').withCause('Same as the other recovery check, except 20% more lenient, implying that 200 bpm is assumed instead.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (let i = 0; i < beatmap.hitObjects.length; i++) {
      if (!(beatmap.hitObjects.items[i] instanceof Spinner))
        continue;

      const spinner = beatmap.hitObjects.items[i] as Spinner;
      const nextObject: OsuHitObject | null = beatmap.hitObjects.items[i + 1] ?? null;

      yield * this.getLengthIssues(beatmap, spinner);

      if (nextObject)
        yield * this.getRecoveryIssues(beatmap, spinner, nextObject);
    }
  }

  * getLengthIssues(beatmap: VerifierBeatmap<OsuHitObject>, spinner: Spinner) {
    const spinnerTime = spinner.duration;
    const spinnerTimeExpected = [1000, 750, 500]; // 4, 3 and 2 beats respectively, 240 bpm

    const diffIndex = beatmap.getDifficulty(true);
    if (diffIndex === null)
      return;

    const expectedLength = Math.ceil(spinnerTimeExpected[diffIndex] * expectedMultiplier);

    const problemThreshold = spinnerTimeExpected[diffIndex];
    const warningThreshold = spinnerTimeExpected[diffIndex] * 1.2; // same thing but 200 bpm instead

    if (spinnerTime < problemThreshold)
      yield this.createIssue(this.templates['Problem Length'], beatmap, spinner, Math.round(spinnerTime), Math.round(expectedLength));
    else if (spinnerTime < warningThreshold)
      yield this.createIssue(this.templates['Warning Length'], beatmap, spinner, Math.round(spinnerTime), Math.round(expectedLength));
  }

  * getRecoveryIssues(beatmap: VerifierBeatmap<OsuHitObject>, spinner: Spinner, nextObject: OsuHitObject) {
    if (nextObject instanceof Spinner)
      return;

    const recoveryTime = nextObject.startTime - spinner.endTime;

    const timingPoint = beatmap.controlPoints.timingPointAt(nextObject.startTime);

    const bpmScaling = this.getScaledTiming(timingPoint.bpm);
    const recoveryTimeScaled = recoveryTime / bpmScaling;

    const recoveryTimeExpected = [1000, 500, 250];

    const diffIndex = beatmap.getDifficulty(true);

    if (diffIndex === null)
      return;

    const expectedScaledMultiplier = bpmScaling < 1 ? bpmScaling : 1;

    const expectedRecovery = Math.ceil(recoveryTimeExpected[diffIndex] * expectedScaledMultiplier * expectedMultiplier);

    const problemThreshold = recoveryTimeExpected[diffIndex];
    const warningThreshold = recoveryTimeExpected[diffIndex] * 1.2;

    if (recoveryTimeScaled < problemThreshold && recoveryTime < problemThreshold)
      yield this.createIssue(this.templates['Problem Recovery'], beatmap, spinner, Math.round(recoveryTime), expectedRecovery);

    else if (recoveryTimeScaled < problemThreshold && recoveryTime < warningThreshold)
      yield this.createIssue(this.templates['Warning Recovery'], beatmap, spinner, Math.round(recoveryTime), expectedRecovery);
  }

  getScaledTiming(bpm: number) {
    return bpm ** 2 / 14400 - bpm / 80 + 1;
  }
}
