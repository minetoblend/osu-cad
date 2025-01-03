import type { IBeatmap } from '../../../../beatmap/IBeatmap';
import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';
import { Slider } from '../../hitObjects/Slider';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Compose/CheckAbnormalNodes.cs
export class AbnormalNodesIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
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
}

export class CheckAbnormalNodes extends BeatmapCheck<OsuHitObject> {
  override * getIssues(beatmap: IBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    for (const slider of beatmap.hitObjects.ofType(Slider)) {
      if (slider.controlPoints.length > 10 * Math.sqrt(slider.path.expectedDistance)) {
        yield new AbnormalNodesIssue({
          level: 'warning',
          message: `Slider contains ${slider.controlPoints.length} nodes`,
          timestamp: slider,
          cause: 'A slider contains more nodes than 10 times the square root of its length in pixels.',
        });
      }
    }
  }
}
