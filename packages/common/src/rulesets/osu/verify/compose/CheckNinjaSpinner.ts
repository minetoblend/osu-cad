import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckNinjaSpinner.cs
export class NinjaSpinnerIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
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
}

export class CheckNinjaSpinner extends BeatmapCheck<OsuHitObject> {
  override * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const spinner of beatmap.hitObjects.ofType(Spinner)) {
      const od = beatmap.difficulty.overallDifficulty;

      const warningThreshold = 500 + (od < 5 ? (5 - od) * -21.8 : (od - 5) * 20); // anything above this works fine

      const problemThreshold = 450 + (od < 5 ? (5 - od) * -17 : (od - 5) * 17); // anything above this only works sometimes

      if (spinner.duration < problemThreshold) {
        yield new NinjaSpinnerIssue({
          level: 'problem',
          message: 'Spinner is too short, auto cannot achieve 1000 points on this.',
          timestamp: spinner,
        });
      }

      else if (spinner.duration < warningThreshold) {
        yield new NinjaSpinnerIssue({
          level: 'warning',
          message: 'Spinner may be too short, ensure auto can achieve 1000 points on this.',
          timestamp: spinner,
        });
      }
    }
  }
}
