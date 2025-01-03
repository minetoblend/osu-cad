import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
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

  override * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const spinner of beatmap.hitObjects.ofType(Spinner)) {
      const od = beatmap.difficulty.overallDifficulty;

      const warningThreshold = 500 + (od < 5 ? (5 - od) * -21.8 : (od - 5) * 20); // anything above this works fine

      const problemThreshold = 450 + (od < 5 ? (5 - od) * -17 : (od - 5) * 17); // anything above this only works sometimes

      if (spinner.duration < problemThreshold) {
        yield this.createIssue({
          level: 'problem',
          message: 'Spinner is too short, auto cannot achieve 1000 points on this.',
          beatmap,
          timestamp: spinner,
        });
      }

      else if (spinner.duration < warningThreshold) {
        yield this.createIssue({
          level: 'warning',
          message: 'Spinner may be too short, ensure auto can achieve 1000 points on this.',
          beatmap,
          timestamp: spinner,
        });
      }
    }
  }
}
