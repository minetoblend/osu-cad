import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { almostEquals } from '@osucad/framework';

export class CheckDifficultySettings extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Settings',
      message: 'Abnormal difficulty settings.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing difficulty settings from including more than 1 decimal.
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
            Settings having more than 1 decimal place is currently unrankable for, what is probably, two reasons:
            <ul>
                <li>
                    The precision for anything greater than 1 place matters too little to be worth increasing the amount of
                    digits in the song selection screen/website.
                </li>
                <li>
                    Searching for e.g. AR=9.25 will not find maps with AR 9.25. However, searching for AR=9.2 will.
                </li>
            </ul>
            <image>
                https://i.imgur.com/ySldNaU.png
                More than 1 decimal place compared to 1 decimal place.
            </image>
          `),
        },
      ],
    };
  }

  override templates = {
    decimals: new IssueTemplate('problem', '{0:###?} {1} has more than 1 decimal place.', 'value', 'setting').withCause('A difficulty setting has more than 1 decimal place.'),
    other: new IssueTemplate('warning', '{0:###?} {1}, although is capped between {2} to {3} in-game.', 'value', 'setting').withCause('A difficulty setting is less than 0 or greater than 10.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    yield * this.getIssue(beatmap, beatmap.difficulty.hpDrainRate, 'Hp Drain Rate');
    yield * this.getIssue(beatmap, beatmap.difficulty.circleSize, 'Circle Size');
    yield * this.getIssue(beatmap, beatmap.difficulty.approachRate, 'Approach Rate');
    yield * this.getIssue(beatmap, beatmap.difficulty.overallDifficulty, 'Overall Difficulty');
  }

  * getIssue(beatmap: VerifierBeatmap<OsuHitObject>, setting: number, name: string, minSetting = 0, maxSetting = 10) {
    if (setting < minSetting || setting > maxSetting)
      yield this.createIssue(this.templates.other, beatmap, setting, name, minSetting, maxSetting);

    if (!almostEquals(setting, Math.round(setting * 10) / 10, 10e-6))
      yield this.createIssue(this.templates.decimals, beatmap, setting, name);
  }
}
