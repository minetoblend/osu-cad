import type { CheckMetadata, HitObject, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { Slider } from '../../hitObjects/Slider';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/Standard/Compose/CheckObscuredReverse.cs
export class CheckObscuredReverse extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
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

  override templates = {
    obscured: new IssueTemplate('warning', '{0:timestamp} Reverse arrow {1} obscured.', 'timestamp - ', '(potentially)').withCause('An object before a reverse arrow ends over where it appears close in time.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjectsOfType(Slider)) {
      if (slider.repeatCount <= 0)
        continue;

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
        yield this.createIssue(this.templates.obscured, beatmap, [...selectedObjects], isSerious ? '' : 'potentially ');
      }
    }
  }
}
