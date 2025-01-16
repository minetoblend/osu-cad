import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckNinjaSpinner.cs
export class CheckNinjaSpinner extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Compose',
      message: 'Too short spinner.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing spinners from being so short that you almost need to memorize them in order to react
              to them before they end."
        `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Players generally react much slower than auto, so if auto can't even acheive 1000 points on the
              spinner, players will likely not get any points at all, much less pass it without losing accuracy.
              In general, these are just not fun to play due to needing to memorize them for a fair experience."
          `),
        },
      ],
    };
  }

  override templates = {
    problem: new IssueTemplate('problem', '{0:timestamp} Spinner is too short, auto cannot achieve 1000 points on this.', 'timestamp - ').withCause('A spinner is predicted to, based on the OD and BPM, not be able to achieve 1000 points on this, and by a ' + 'margin to account for any inconsistencies.'),
    warning: new IssueTemplate('warning', '{0:timestamp} Spinner may be too short, ensure auto can achieve 1000 points on this.', 'timestamp - ').withCause('Same as the other check, but without the margin, meaning the threshold is lower.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const spinner of beatmap.hitObjectsOfType(Spinner)) {
      const od = beatmap.difficulty.overallDifficulty;

      const warningThreshold = 500 + (od < 5 ? (5 - od) * -21.8 : (od - 5) * 20); // anything above this works fine

      const problemThreshold = 450 + (od < 5 ? (5 - od) * -17 : (od - 5) * 17); // anything above this only works sometimes

      if (spinner.duration < problemThreshold) {
        yield this.createIssue(this.templates.problem, beatmap, spinner);
      }

      else if (spinner.duration < warningThreshold) {
        yield this.createIssue(this.templates.warning, beatmap, spinner);
      }
    }
  }
}
