import type { Vec2 } from 'osucad-framework';
import type { EditorBeatmap } from 'packages/common/src/editor';
import type { IssueMetadata, IssueOptions } from '../../../verifier/Issue';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { trimIndent } from '../../../utils/stringUtils';
import { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import { Issue } from '../../../verifier/Issue';
import { HitCircle } from '../hitObjects/HitCircle';
import { Slider } from '../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckOffscreen.cs
export class OffScreenIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
    return {
      category: 'Compose',
      message: 'Offscreen hit objects',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
            Preventing the border of hit objects from even partially becoming offscreen in 4:3 aspect ratios.
            <note>
                4:3 is included in 16:9 and 16:10, the only difference is the width, so you can check for
                offscreens along the top and bottom in any of these aspect ratios and it will look the same.
            </note>
            <image-right>
                https://i.imgur.com/zXT4Zwr.png
                A slider end which is partially offscreen along the bottom of the screen.
            </image>"
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
            Although everything is technically readable and playable if an object is only partially offscreen,
            it trips up players using relative movement input (for example mouse) when their cursor hits the
            side of the screen, since the game will offset the cursor back into the screen which is difficult
            to correct while in the middle of gameplay.
            <br><br>
            Since objects partially offscreen also have a smaller area to hit, if not hitting the screen
            causing the problems above, it makes those objects need more precision to play which isn't
            consistent with how the rest of the game works, especially considering that the punishment for
            overshooting is getting your cursor offset slightly but still hitting the object and not missing
            like you probably would otherwise.
          `),
        },
      ],
    };
  }
}

const LOWER_LIMIT = 428;
const UPPER_LIMIT = -60;
const LEFT_LIMIT = -67;
const RIGHT_LIMIT = 579;

export class CheckOffscreen extends BeatmapCheck<OsuHitObject> {
  override * check(beatmap: EditorBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const hitObject of beatmap.hitObjects) {
      const objectType = hitObject instanceof HitCircle ? 'Circle' : 'Slider head';

      if (!(hitObject instanceof HitCircle) && !(hitObject instanceof Slider))
        continue;

      const circleRadius = hitObject.radius;
      const stackOffset = hitObject.stackOffset;

      if (hitObject.stackedPosition.y + circleRadius > LOWER_LIMIT) {
        yield new OffScreenIssue({
          level: 'problem',
          timestamp: hitObject,
          message: `${objectType} is offscreen.`,
        });
      }
      else if (this.getOffscreenBy(hitObject.radius, hitObject.stackedPosition) > 0) {
        const stackableObject = hitObject;

        const goesOffscreenTopOrLeft = (stackableObject.stackedPosition.y - circleRadius < UPPER_LIMIT || stackableObject.stackedPosition.x - circleRadius < LEFT_LIMIT) && stackableObject.stackHeight > 0;

        const goesOffscreenRight = stackableObject.stackedPosition.y + circleRadius > RIGHT_LIMIT && stackableObject.stackHeight < 0;

        if (goesOffscreenTopOrLeft || goesOffscreenRight) {
          yield new OffScreenIssue({
            level: 'problem',
            timestamp: hitObject,
            message: `${objectType} is offscreen.`,
          });
        }
        else {
          yield new OffScreenIssue({
            level: 'warning',
            timestamp: hitObject,
            message: `${objectType} would be offscreen, but the game prevents it.`,
          });
        }
      }

      if (!(hitObject instanceof Slider))
        return;

      if (this.getOffscreenBy(hitObject.radius, hitObject.endPosition) > 0) {
        yield new OffScreenIssue({
          level: 'problem',
          timestamp: hitObject,
          message: `Slider tail is offscreen.`,
        });
      }
      else {
        for (const pathPosition of hitObject.path.calculatedRange.path) {
          if (this.getOffscreenBy(hitObject.radius, pathPosition.add(hitObject.stackedPosition)) <= 0)
            continue;

          yield new OffScreenIssue({
            level: 'problem',
            message: 'Slider body is offscreen',
            timestamp: hitObject,
          });

          break;
        }
      }
    }
  }

  getOffscreenBy(circleRadius: number, point: Vec2, leniency: number = 0) {
    const offscreenRight = point.x + circleRadius - RIGHT_LIMIT + leniency;
    const offscreenLeft = circleRadius - point.x + LEFT_LIMIT + leniency;
    const offscreenLower = point.y + circleRadius - LOWER_LIMIT + leniency;
    const offscreenUpper = circleRadius - point.y + UPPER_LIMIT + leniency;

    const offscreenBy = Math.max(
      0,
      offscreenLeft,
      offscreenRight,
      offscreenLower,
      offscreenUpper,
    );

    return Math.ceil(offscreenBy * 100) / 100;
  }
}
