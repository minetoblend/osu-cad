import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmapSet } from '../../../../verifier/VerifierBeatmapSet';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { zipWithNext } from '../../../../utils/arrayUtils';
import { GeneralCheck } from '../../../../verifier/GeneralCheck';
import { DifficultyType } from '../../../../verifier/VerifierBeatmap';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Spinner } from '../../hitObjects/Spinner';
import { OsuRuleset } from '../../OsuRuleset';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckCloseOverlap.cs
export class CheckCloseOverlap extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'spread',
      message: 'Objects too close in time not overlapping.',
      author: 'Naxess',
    };
  }

  override async* getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const problemThreshold = 125; // Shortest acceptable gap is 1/2 in 240 BPM, 125 ms.
    const warningThreshold = 188; // Shortest gap before warning is 1/2 in 160 BPM, 188 ms.

    let skipAfterDifficulty = DifficultyType.Normal;

    for (const beatmap of mapset.beatmaps) {
      if (!beatmap.ruleset || !(beatmap.ruleset instanceof OsuRuleset))
        continue;

      const difficulty = beatmap.getDifficulty(true);

      if (difficulty !== null && difficulty > skipAfterDifficulty)
        break;

      // This check only applies to easy/lowest diff normals, so if we find an easy, normals cannot not be lowest diff.
      if (difficulty === DifficultyType.Easy)
        skipAfterDifficulty = DifficultyType.Easy;

      for (const [hitObject, next] of zipWithNext(beatmap.hitObjects.items as OsuHitObject[])) {
        if (!(hitObject instanceof HitCircle) || next instanceof Spinner)
          continue;

        if (next.startTime - hitObject.startTime >= warningThreshold)
          continue;

        const distance = next.stackedPosition.distance(hitObject.stackedPosition);

        const radius = hitObject.radius;

        if (distance < radius * 2)
          continue;

        if (next.startTime - hitObject.startTime < problemThreshold) {
          yield this.createIssue({
            level: 'problem',
            message: `${Math.round(next.startTime - hitObject.startTime)} ms apart, should either be overlapped or at least ${problemThreshold} ms apart.`,
            beatmap,
            timestamp: [hitObject, next],
            cause: 'Two objects with a time gap less than 125 ms (240 bpm 1/2) are not overlapping.',
          });
        }

        else {
          yield this.createIssue({
            level: 'warning',
            message: `${Math.round(next.startTime - hitObject.startTime)} ms apart.`,
            beatmap,
            timestamp: [hitObject, next],
            cause: 'Two objects with a time gap less than 167 ms (180 bpm 1/2) are not overlapping.',
          });
        }
      }
    }
  }
}
