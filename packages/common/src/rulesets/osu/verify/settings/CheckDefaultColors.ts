import type { IBeatmap } from '../../../../beatmap/IBeatmap';
import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Settings/CheckDefaultColours.cs
export class DefaultColorsIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
    return {
      category: 'Settings',
      message: 'Default combo colours without forced skin',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing the combo colours chosen without additional input from blending into the background.
              <image-right>
                  https://i.imgur.com/G5vTU7f.png
                  The combo colour section in song setup without custom colours ticked.
              </image>
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
                If you leave the combo colour setting as it is when you create a beatmap, no [Colours] section will
                be created in the .osu, meaning the skins of users will override them. Since we can't control which
                colours they may use or force them to dim the background, the colours may blend into the background
                making for an unfair gameplay experience.
                <br><br>
                If you set a preferred skin in the beatmap however, for example default, that skin will be used over
                any user skin, but many players switch skins to get away from default, so would not recommend this.
                If you want the default colours, simply tick the ""Enable Custom Colours"" checkbox instead."
            `),
        },
      ],
    };
  }
}

export class CheckDefaultColors extends BeatmapCheck<any> {
  override * getIssues(beatmap: IBeatmap<any>): Generator<Issue, void, undefined> {
    const noSkinPreference = beatmap.settings.skinPreference === '' || beatmap.settings.skinPreference === 'Default';
    if (noSkinPreference && beatmap.colors.comboColors.length === 0) {
      yield new DefaultColorsIssue({
        level: 'problem',
        message: 'Default combo colours without preferred skin.',
      });
    }
  }
}