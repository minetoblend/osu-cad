import type { CheckMetadata, Issue, VerifierBeatmapSet } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { DifficultyType, GeneralCheck, IssueTemplate, zipWithNext } from '@osucad/core';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Spinner } from '../../hitObjects/Spinner';
import { OsuRuleset } from '../../OsuRuleset';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckCloseOverlap.cs
export class CheckCloseOverlap extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Spread',
      message: 'Objects too close in time not overlapping.',
      author: 'Naxess',
    };
  }

  override templates = {
    problem: new IssueTemplate('problem', '{0:timestamp} {1} ms apart, should either be overlapped or at least {2} ms apart.', 'timestamp - ', 'gap', 'threshold').withCause('Two objects with a time gap less than 125 ms (240 bpm 1/2) are not overlapping.'),
    warning: new IssueTemplate('warning', '{0} {1} ms apart.', 'timestamp - ', 'gap').withCause('Two objects with a time gap less than 167 ms (180 bpm 1/2) are not overlapping.'),
  };

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

        if (next.startTime - hitObject.startTime < problemThreshold)
          yield this.createIssue(this.templates.problem, beatmap, [hitObject, next], Math.round(next.startTime - hitObject.startTime), problemThreshold);
        else
          yield this.createIssue(this.templates.warning, beatmap, [hitObject, next], Math.round(next.startTime - hitObject.startTime));
      }
    }
  }
}
