import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, DifficultyType, IssueTemplate } from '@osucad/core';
import { Slider } from '../../hitObjects/Slider';

// https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckMultipleReverses.cs
export class CheckMultipleReverse extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Spread',
      message: 'Multiple reverses on too short sliders.',
      author: 'Naxess',
    };
  }

  override templates = {
    problem: new IssueTemplate('problem', '{0:timestamp} This slider is way too short to have multiple reverses.', 'timestamp - ').withCause('A slider has at least 2 reverses and is 250 ms or shorter (240 bpm 1/1) in an Easy, ' + 'or 125 ms or shorter (240 bpm 1/2) in a Normal.'),
    warning: new IssueTemplate('warning', '{0:timestamp} This slider is very short to have multiple reverses.', 'timestamp - ').withCause('A slider has at least 2 reverses and is 333 ms or shorter (180 bpm 1/1) in an Easy, ' + 'or 167 ms or shorter (180 bpm 1/2) in a Normal.'),
  };

  override async* getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    const problemThreshold = 60000 / 240;
    const warningThreshold = 60000 / 180;

    const difficulty = beatmap.getDifficulty(true);

    for (const slider of beatmap.hitObjectsOfType(Slider)) {
      if (slider.spanCount <= 2)
        continue;

      if (difficulty === DifficultyType.Easy) {
        if (slider.duration < problemThreshold)
          yield this.createIssue(this.templates.problem, beatmap, slider);
        else if (slider.duration < warningThreshold)
          yield this.createIssue(this.templates.warning, beatmap, slider);
      }
      else if (difficulty === DifficultyType.Normal) {
        if (slider.duration < problemThreshold * 0.5)
          yield this.createIssue(this.templates.problem, beatmap, slider);
        else if (slider.duration < warningThreshold * 0.5)
          yield this.createIssue(this.templates.warning, beatmap, slider);
      }
    }
  }
}
