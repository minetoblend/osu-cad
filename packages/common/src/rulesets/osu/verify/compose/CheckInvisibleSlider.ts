import type { IBeatmap } from 'packages/common/src/beatmap';
import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Compose/CheckInvisibleSlider.cs
export class InvisibleSliderIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
    return {
      category: 'Compose',
      message: 'Invisible sliders.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing objects from being invisible.
              <image-right>
                  https://i.imgur.com/xJIwdbA.png
                  A slider with no nodes; looks like a circle on the timeline but is invisible on the playfield.
              </image>"
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Although often used in combination with a storyboard to make up for the invisiblity through sprites, there
              is no way to force the storyboard to appear, meaning players may play the map unaware that they should have
              enabled something for a fair gameplay experience."
          `),
        },
      ],
    };
  }
}

export class CheckInvisibleSlider extends BeatmapCheck<OsuHitObject> {
  override * getIssues(beatmap: IBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      if (slider.controlPoints.length === 0) {
        yield new InvisibleSliderIssue({
          level: 'problem',
          message: 'Slider has no control points',
          timestamp: slider,
        });
      }
      else if (slider.path.expectedDistance < 0) {
        yield new InvisibleSliderIssue({
          level: 'problem',
          message: 'Slider has negative pixel length',
          timestamp: slider,
        });
      }
    }
  }
}
