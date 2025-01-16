import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { Vec2 } from '@osucad/framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckOffscreen.cs

const LOWER_LIMIT = 428;
const UPPER_LIMIT = -60;
const LEFT_LIMIT = -67;
const RIGHT_LIMIT = 579;

export class CheckOffscreen extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
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

  override templates = {
    offscreen: new IssueTemplate('problem', '{0:timestamp} {1} is offscreen.', 'timestamp - ', 'object').withCause('The border of a hit object is partially off the screen in 4:3 aspect ratios.'),
    prevented: new IssueTemplate('warning', '{0:timestamp} {1} would be offscreen, but the game prevents it.', 'timestamp - ', 'object').withCause('The .osu code implies the hit object is in a place where it would be off the 512x512 playfield area, but the game has ' + 'moved it back inside the screen automatically.'),
    bezierMargin: new IssueTemplate('warning', '{0} Slider body is possibly offscreen, ensure the entire white border is visible on a 4:3 aspect ratio.', 'timestamp - ').withCause('The slider body of a bezier slider is approximated to be 1 osu!pixel away from being offscreen at some point on its curve.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const hitObject of beatmap.hitObjects) {
      const objectType = hitObject instanceof HitCircle ? 'Circle' : 'Slider head';

      if (!(hitObject instanceof HitCircle) && !(hitObject instanceof Slider))
        continue;

      const circleRadius = hitObject.radius;
      const stackOffset = hitObject.stackOffset;

      if (hitObject.stackedPosition.y + circleRadius > LOWER_LIMIT) {
        yield this.createIssue(this.templates.offscreen, beatmap, hitObject, objectType);
      }
      else if (this.getOffscreenBy(hitObject.radius, hitObject.stackedPosition) > 0) {
        const stackableObject = hitObject;

        const goesOffscreenTopOrLeft = (stackableObject.stackedPosition.y - circleRadius < UPPER_LIMIT || stackableObject.stackedPosition.x - circleRadius < LEFT_LIMIT) && stackableObject.stackHeight > 0;

        const goesOffscreenRight = stackableObject.stackedPosition.x + circleRadius > RIGHT_LIMIT && stackableObject.stackHeight < 0;

        if (goesOffscreenTopOrLeft || goesOffscreenRight) {
          yield this.createIssue(this.templates.offscreen, beatmap, hitObject, objectType);
        }
        else {
          yield this.createIssue(this.templates.prevented, beatmap, hitObject, objectType);
        }
      }

      if (!(hitObject instanceof Slider))
        return;

      if (this.getOffscreenBy(hitObject.radius, hitObject.endPosition) > 0) {
        yield this.createIssue(this.templates.offscreen, beatmap, hitObject, 'Slider tail');
      }
      else {
        for (const pathPosition of hitObject.path.calculatedRange.path) {
          if (this.getOffscreenBy(hitObject.radius, pathPosition.add(hitObject.stackedPosition)) <= 0)
            continue;

          yield this.createIssue(this.templates.offscreen, beatmap, hitObject, 'Slider body');

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
