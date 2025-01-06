import type { CheckMetadata } from '../../../../verifier/BeatmapCheck';
import type { Issue } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { IssueTemplate } from '../../../../verifier/template/IssueTemplate';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Compose/CheckAbnormalNodes.cs
export class CheckAbnormalNodes extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Compose',
      message: 'Abnormal amount of slider nodes.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing mappers from writing inappropriate or otherwise harmful messages using slider nodes.
              <image-right>
                  https://i.imgur.com/rlCoEtZ.png
                  An example of text being written with slider nodes in a way which can easily be hidden offscreen.
              </image>"
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              The code of conduct applies to all aspects of the ranking process, including the beatmap content itself,
              whether that only be visible through the editor or in gameplay as well."
          `),
        },
      ],
    };
  }

  override templates = {
    abnormal: new IssueTemplate('warning', '{0} Slider contains {1} nodes.', 'timestamp - ', 'amount').withCause('A slider contains more nodes than 10 times the square root of its length in pixels.'),

  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      if (slider.controlPoints.length > 10 * Math.sqrt(slider.path.expectedDistance))
        yield this.createIssue(this.templates.abnormal, beatmap, slider, slider.controlPoints.length);
    }
  }
}
