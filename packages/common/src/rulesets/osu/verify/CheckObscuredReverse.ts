import type { IssueMetadata, IssueOptions } from 'packages/common/src/verifier/Issue';
import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { HitObject } from '../../../hitObjects/HitObject';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Issue } from 'packages/common/src/verifier/Issue';
import { trimIndent } from '../../../utils/stringUtils';
import { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import { Slider } from '../hitObjects/Slider';
import { Spinner } from '../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckObscuredReverse.cs
export class ObscuredReverseIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
    return {
      category: 'Compose',
      message: 'Obscured reverse arrows.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
            Preventing slider reverses from being covered up by other objects or combo bursts before players
            can react to them.
            <image-right>
                https://i.imgur.com/BS8BkT7.png
                Although many skins remove combo bursts, these can hide reverses under them in the same way
                other objects can in gameplay, so only looking at the editor is a bit misleading.
            </image>"
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Some mappers like to stack objects on upcoming slider ends to make everything seem more
              coherent, but in doing so, reverses can become obscured and impossible to read unless you know
              they're there. For more experienced players, however, this isn't as much of a problem since you
              learn to hold sliders more efficiently and can react faster."
          `),
        },
      ],
    };
  }
}

export class CheckObscuredReverse extends BeatmapCheck<OsuHitObject> {
  override * check(beatmap: IBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      const closeThreshold = slider.radius / 1.75;
      const tooCloseThreshold = slider.radius / 3;

      const reverseTime = slider.startTime + slider.duration;
      const reversePosition = slider.stackedPosition.add(slider.path.endPosition);

      const selectedObjects = new Set<HitObject>();
      let isSerious = false;

      const hitObjectsRightBeforeReverse = beatmap.hitObjects.filter(otherHitObject => otherHitObject.endTime > reverseTime - slider.timePreempt && otherHitObject.endTime < reverseTime);

      for (const otherHitObject of hitObjectsRightBeforeReverse) {
        if (otherHitObject instanceof Spinner)
          continue;

        let distanceToReverse;

        if (otherHitObject instanceof Slider)
          distanceToReverse = otherHitObject.stackedEndPosition.distance(reversePosition);
        else
          distanceToReverse = otherHitObject.stackedPosition.distance(reversePosition);

        if (distanceToReverse < tooCloseThreshold)
          isSerious = true;

        if (distanceToReverse >= closeThreshold)
          continue;

        selectedObjects.add(slider);
        selectedObjects.add(otherHitObject);

        break;
      }

      if (selectedObjects.size > 0) {
        yield new ObscuredReverseIssue({
          level: 'info',
          message: `Reverse arrow ${isSerious ? '' : 'potentially'} obscured`,
          timestamp: [...selectedObjects].sort((a, b) => a.startTime - b.startTime),
          cause: 'An object before a reverse arrow ends over where it appears close in time.',
        });
      }
    }
  }
}
