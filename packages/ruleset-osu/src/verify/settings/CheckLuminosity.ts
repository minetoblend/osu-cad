import type { CheckMetadata, Issue, VerifierBeatmap } from '@osucad/core';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { BeatmapCheck, IssueTemplate, trimIndent } from '@osucad/core';
import { ColorUtils } from '@osucad/framework';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Settings/CheckLuminosity.cs

export class CheckLuminosity extends BeatmapCheck<OsuHitObject> {
  override get metadata(): CheckMetadata {
    return {
      category: 'Settings',
      message: 'Too dark or bright combo colours or slider borders.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: trimIndent(`
              Preventing combo colours from blending into dimmed backgrounds or flashing too intensely in kiai.
          `),
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Although objects by default have a white border around them making them visible, the approach circles are
              affected by combo colour and will become impossible to see with colour 0,0,0. Stripping the game of
              important gameplay indicators or generally messing with them (see check for modified breaks) is not
              something beatmaps are expected to do, as they need to be consistent to work properly.
              <image-right>
                  https://i.imgur.com/wxoMMQG.png
                  A slider whose approach circle is only visible on its borders and path, due to the rest blending into
                  the dimmed bg.
              </image>
              <br><br>
              As for bright colours, when outside of kiai they're fine, but while in kiai the game flashes them,
              attempting to make them even brighter without caring about them already being really bright, resulting in
              pretty strange behaviour for some monitors and generally just unpleasant contrast.
              <image-right>
                  https://i.imgur.com/9cRTvJc.png
                  An example of a slider with colour 255,255,255 while in the middle of flashing.
              </image>
              <br><br>
              This check uses the <a href="http://alienryderflex.com/hsp.html">HSP colour system</a> to better approximate
              the way humans perceive luminosity in colours, as opposed to the HSL system where green is regarded the same
              luminosity as deep blue, see image.
              <image>
                  https://i.imgur.com/CjPhf0b.png
                  The HSP colour system compared to the in-game HSL system.
              </image>
          `),
        },
      ],
    };
  }

  override templates = {
    'Problem Combo': new IssueTemplate('problem', 'Combo colour {0} is way too dark.', 'number').withCause('The HSP luminosity value of a combo colour is lower than 30. These ' + 'values are visible in the overview section as tooltips for each colour ' + 'if you want to check them manually.'),
    'Warning Combo': new IssueTemplate('warning', 'Combo colour {0} is really dark.', 'number').withCause('Same as the first check, but lower than 43 instead.'),
    'Problem Border': new IssueTemplate('problem', 'Slider border is way too dark.').withCause('Same as the first check, except applies on the slider border instead.'),
    'Warning Border': new IssueTemplate('warning', 'Slider border is really dark.').withCause('Same as the second check, except applies on the slider border instead.'),
    'Bright': new IssueTemplate('warning', 'Combo colour {0} is really bright in kiai sections, see {1:timestamp}.', 'number', 'example object').withCause('Same as the first check, but higher than 250 and requires that at least one hit object with the combo is in a kiai section.'),
  };

  override async * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): AsyncGenerator<Issue, void, undefined> {
    const luminosityMinRankable = 30;
    const luminosityMinWarning = 43;
    const luminosityMax = 250;

    if (beatmap.colors.sliderBorder !== null) {
      const color = beatmap.colors.sliderBorder!;
      const luminosity = ColorUtils.getLuminosity(color);

      if (luminosity < luminosityMinRankable)
        yield this.createIssue(this.templates['Problem Border'], beatmap);
      else if (luminosity < luminosityMinWarning)
        yield this.createIssue(this.templates['Warning Border'], beatmap);

      const comboColorsInKiai: number[] = [];
      const comboColorTime: number[] = [];

      for (const hitObject of beatmap.hitObjects) {
        const combo = beatmap.colors.getComboColor(hitObject.comboIndex).toNumber();

        if (hitObject instanceof Spinner || !beatmap.controlPoints.effectPointAt(hitObject.startTime + 1).kiaiMode || comboColorsInKiai.includes(combo))
          continue;

        comboColorsInKiai.push(combo);
        comboColorTime.push(hitObject.startTime);
      }

      for (let i = 0; i < beatmap.colors.comboColors.length; i++) {
        const color = beatmap.colors.comboColors[i];
        const luminosity = ColorUtils.getLuminosity(color);

        const displayedColorIndex = asDisplayedComboColorIndex(beatmap, i);

        if (luminosity < luminosityMinRankable)
          yield this.createIssue(this.templates['Problem Combo'], beatmap, displayedColorIndex);

        else if (luminosity < luminosityMinWarning)
          yield this.createIssue(this.templates['Warning Combo'], beatmap, displayedColorIndex);

        for (let j = 0; j < comboColorsInKiai.length; ++j) {
          if (luminosity > luminosityMax && comboColorsInKiai[j] === i)
            yield this.createIssue(this.templates.Bright, beatmap, displayedColorIndex, comboColorTime[j]);
        }
      }
    }
  }
}

function asDisplayedComboColorIndex(beatmap: VerifierBeatmap<any>, zeroBasedIndex: number) {
  return zeroBasedIndex === 0 ? beatmap.colors.comboColors.length : zeroBasedIndex;
}
