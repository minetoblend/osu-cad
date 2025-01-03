import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { almostEquals } from 'osucad-framework';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';

;

export class DifficultySettingsIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
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
}

export class CheckDifficultySettings extends BeatmapCheck<OsuHitObject> {
  override * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    yield * this.getIssue(beatmap.difficulty.hpDrainRate, 'Hp Drain Rate');
    yield * this.getIssue(beatmap.difficulty.circleSize, 'Circle Size');
    yield * this.getIssue(beatmap.difficulty.approachRate, 'Approach Rate');
    yield * this.getIssue(beatmap.difficulty.overallDifficulty, 'Overall Difficulty');
  }

  * getIssue(setting: number, name: string, minSetting = 0, maxSetting = 10) {
    if (setting < minSetting || setting > maxSetting) {
      yield new DifficultySettingsIssue({
        level: 'warning',
        message: `${Math.round(setting * 10000) / 10000} ${name}, although rounding is capped to ${minSetting} to ${maxSetting} in game.`,
        cause: `A difficulty setting is less than ${minSetting} or greater than ${maxSetting}.`,
      });
    }

    if (!almostEquals(setting, Math.round(setting * 10) / 10, 10e-6)) {
      yield new DifficultySettingsIssue({
        level: 'problem',
        message: `${Math.round(setting * 10000) / 10000} ${name} has more than one decimal place. `,
        cause: 'A difficulty setting has more than 1 decimal place.',
      });
    }
  }
}
