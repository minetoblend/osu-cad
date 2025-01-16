import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { almostEquals } from '@osucad/framework';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Settings/CheckTickRate.cs
export class CheckTickRate extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Settings',
      message: 'Slider tick rates not aligning with any common beat snap divisor.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
            Ensuring that slider ticks align with the song's beat structure.
            <image-right>
                https://i.imgur.com/2NVm2aB.png
                A 1/1 slider with an asymmetric tick rate (neither a tick in the middle nor two equally distanced from it).
            </image>
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Slider ticks, just like any other object, should align with the song in some way. If slider ticks are going after a 1/5 beat
              structure, for instance, that's either extremely rare or much more likely a mistake.
          `),
        },
      ],
    };
  }

  override templates = {
    tickRate: new IssueTemplate('problem', '{0} {1}.', 'setting', 'value').withCause('The slider tick rate setting of a beatmap is using an incorrect or otherwise extremely uncommon divisor.' + '<note>Common tick rates include any full integer as well as 1/2, 4/3, and 3/2. Excludes precision errors.</note>'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    const tickRate = beatmap.difficulty.sliderTickRate;

    const approxTickRate = Math.round(tickRate * 1000) / 1000;
    if (tickRate - Math.floor(tickRate) !== 0 && !almostEquals(approxTickRate, 0.5) && !almostEquals(approxTickRate, 1.333) && !almostEquals(approxTickRate, 1.5))
      yield this.createIssue(this.templates.tickRate, beatmap, approxTickRate, 'slider tick rate');
  }
}
