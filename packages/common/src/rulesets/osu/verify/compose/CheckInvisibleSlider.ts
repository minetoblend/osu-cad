import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { IssueTemplate } from '../../../../verifier/template/IssueTemplate';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Compose/CheckInvisibleSlider.cs
export class CheckInvisibleSlider extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
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

  override templates = {
    zeroNodes: new IssueTemplate('problem', '{0:timestamp} has no slider nodes.', 'timestamp - ').withCause('A slider has no nodes.'),
    negativeLength: new IssueTemplate('problem', '{0:timestamp} has negative pixel length.', 'timestamp - ').withCause('A slider has a negative pixel length.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      if (slider.controlPoints.length === 0)
        yield this.createIssue(this.templates.zeroNodes, beatmap, slider);
      else if (slider.path.expectedDistance < 0)
        yield this.createIssue(this.templates.negativeLength, beatmap, slider);
    }
  }
}
