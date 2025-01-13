import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/common';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, DifficultyType, IssueTemplate } from '@osucad/common';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Spread/CheckStackLeniency.cs
export class CheckStackLeniency extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Spread',
      message: 'Perfect stacks too close in time.',
      author: 'Naxess',
      difficulties: [
        DifficultyType.Easy,
        DifficultyType.Normal,
        DifficultyType.Hard,
        DifficultyType.Insane,
      ],
    };
  }

  override templates = {
    problem: new IssueTemplate('problem', '{0:timestamp} Stack leniency should be at least {1}.', 'timestamp - ', 'stack leniency').withCause('Two objects are overlapping perfectly and are less than 1/1, 1/1, 1/2, or 1/4 apart (assuming 160 BPM), for E/N/H/I respectively.'),
    problemFailedStack: new IssueTemplate('problem', '{0:timestamp} Failed stack, objects are {1:##} px apart, which is basically a perfect stack.', 'timestamp - ', 'gap').withCause('Same as the other check, except applies to non-stacked objects within 1/14th of a circle radius of one another.'),
    warning: new IssueTemplate('warning', '{0:timestamp} Stack leniency should be at least {1}.', 'timestamp - ', 'stack leniency').withCause('Same as the other check, except only appears for insane difficulties, as this becomes a guideline.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    const snapping = [1, 1, 0.5, 0.25];

    const diffIndex = beatmap.getDifficulty(true);
    if (diffIndex === null)
      return;

    const timeGap = snapping[diffIndex] * 60000 / 160;

    const hitObjectCount = beatmap.hitObjects.length;

    for (let i = 0; i < hitObjectCount - 1; i++) {
      for (let j = i + 1; j < hitObjectCount; j++) {
        const hitObject = beatmap.hitObjects.items[i];
        const otherHitObject = beatmap.hitObjects.items[j];

        if (hitObject instanceof Spinner || otherHitObject instanceof Spinner)
          break;

        if (otherHitObject.startTime - hitObject.startTime >= timeGap)
          break;

        if (hitObject.stackedPosition.equals(otherHitObject.stackedPosition)) {
          const requiredStackLeniency = Math.ceil((otherHitObject.startTime - hitObject.startTime) / (hitObject.timeFadeIn * 0.1));
          if (diffIndex >= DifficultyType.Insane) {
            yield this.createIssue(this.templates.warning, beatmap, [hitObject, otherHitObject], requiredStackLeniency);
          }
          else {
            yield this.createIssue(this.templates.problem, beatmap, [hitObject, otherHitObject], requiredStackLeniency);
          }
        }
        else {
          const distance = hitObject.stackedPosition.distance(otherHitObject.stackedPosition);

          if (distance > hitObject.radius / 14)
            continue;

          yield this.createIssue(this.templates.problemFailedStack, beatmap, [hitObject, otherHitObject], distance);
        }
      }
    }
  }
}
