import type { IBeatmap } from '../../../../beatmap/IBeatmap';
import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';
import { Slider } from '../../hitObjects/Slider';

export class BuraiIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
    return {
      category: 'Compose',
      message: 'Burai slider.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing sliders from being excessively difficult, or even impossible, to read in gameplay.
              <image-right>
                  https://i.imgur.com/fMa1hWR.png
                  A slider which may be considered readable if it goes right, up, and then down, but would
                  mean going through the same slider path twice for the right and top parts.
              </image>"
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Largely follows the same reasoning as the overlapping slider tail/head/anchor check; if the player
              needs to rely on guessing, and guessing wrong results in a slider break, then that's an unfair
              gameplay experience.
              <br><br>
              A single path going back on itself far enough for the follow circle to not cover everything, is
              neither lenient nor something players will expect considering that sliders are expected to have
              a clear path. When the follow circle does cover the whole path, however, it's generally acceptable
              since even if the player misreads it, it usually doesn't cause any slider breaks.
              <br><br>
              Should a slider go back on itself and end before it creates its own borders, players without slider
              tails enabled will have a hard time seeing how far back into itself it goes, or even if it goes
              back on itself at all.
              <image-right>
                  https://i.imgur.com/StRTQzZ.png
                  A slider which goes back on itself multiple times and is impossible to read for players with
                  slider tails hidden, which is common in skinning.
              </image>"
          `),
        },
      ],
    };
  }
}

export class CheckBurai extends BeatmapCheck<OsuHitObject> {
  override * getIssues(beatmap: IBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      const maxDistance = 3;

      const buraiScores: number[] = [];

      const path = slider.path.calculatedRange.path;

      for (let i = 0; i < path.length; i++) {
        let passedMargin = false;

        for (let j = i + 1; j < path.length; j++) {
          const distance = path[i].distanceSq(path[j]);

          if (!passedMargin && distance >= maxDistance * maxDistance)
            passedMargin = true;

          const angleIntersect = path[i].sub(path[i - 1]).angle();
          const otherAngleIntersect = path[j].sub(path[i]).angle();

          const diffAngleIntersect = Math.abs(wrapAngle(angleIntersect - otherAngleIntersect, 0.5));

          const distanceScore = 100 * Math.sqrt(10) / 10 ** (2 * distance) / 125;
          const angleScore = 1 / ((diffAngleIntersect / Math.PI * 20) ** 3 + 0.01) / 250;

          buraiScores.push(angleScore * distanceScore);
        }
      }

      const totalBuraiScore = getWeighedScore(buraiScores);

      if (totalBuraiScore <= 0)
        continue;

      if (totalBuraiScore > 5) {
        yield new BuraiIssue({
          level: 'warning',
          message: 'Burai',
          timestamp: slider,
        });
      }

      else if (totalBuraiScore > 2) {
        yield new BuraiIssue({
          level: 'warning',
          message: 'Potentially Burai',
          timestamp: slider,
        });
      }
    }
  }
}

function wrapAngle(radians: number, scale: number) {
  return radians > Math.PI * scale ? Math.PI * 2 * scale - radians : radians;
}

function getWeighedScore(buraiScores: number[]) {
  let score = 0;

  // Sort by highest impact and then each following is worth less.
  const sortedScores = buraiScores.toSorted((a, b) => b - a);

  for (let i = 0; i < sortedScores.length; ++i)
    score += sortedScores[i] * (0.9 ** i);

  return score;
}