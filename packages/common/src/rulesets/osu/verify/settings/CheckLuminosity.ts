import type { IssueMetadata, IssueOptions } from '../../../../verifier/Issue';
import type { VerifierBeatmap } from '../../../../verifier/VerifierBeatmap';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { ColorUtils } from 'osucad-framework';
import { TimestampFormatter } from '../../../../editor/TimestampFormatter';
import { trimIndent } from '../../../../utils/stringUtils';
import { BeatmapCheck } from '../../../../verifier/BeatmapCheck';
import { Issue } from '../../../../verifier/Issue';
import { Spinner } from '../../hitObjects/Spinner';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/Settings/CheckLuminosity.cs
export class LuminosityIssue extends Issue {
  constructor(options: IssueOptions) {
    super(options);
  }

  override get metadata(): IssueMetadata {
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
}

export class CheckLuminosity extends BeatmapCheck<OsuHitObject> {
  override * getIssues(beatmap: VerifierBeatmap<OsuHitObject>): Generator<Issue, void, undefined> {
    const luminosityMinRankable = 30;
    const luminosityMinWarning = 43;
    const luminosityMax = 250;

    if (beatmap.colors.sliderBorder !== null) {
      const color = beatmap.colors.sliderBorder!;
      const luminosity = ColorUtils.getLuminosity(color);

      if (luminosity < luminosityMinRankable) {
        yield new LuminosityIssue({
          level: 'problem',
          message: 'Slider border is way too dark.',
          cause: 'Same as the first check, except applies on the slider border instead.',
        });
      }
      else if (luminosity < luminosityMinWarning) {
        yield new LuminosityIssue({
          level: 'problem',
          message: 'Slider border is really dark.',
          cause: 'Same as the first check, except applies on the slider border instead.',
        });
      }

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

        if (luminosity < luminosityMinRankable) {
          yield new LuminosityIssue({
            level: 'problem',
            message: `Combo color ${displayedColorIndex} is way to dark.`,
            cause: 'The HSP luminosity value of a combo colour is lower than 30. These values are visible in the overview section as tooltips for each colour if you want to check them manually.',
          });
        }

        else if (luminosity < luminosityMinWarning) {
          yield new LuminosityIssue({
            level: 'warning',
            message: `Combo color ${displayedColorIndex} is really dark.`,
            cause: 'Same as the first check, but lower than 43 instead.',
          });
        }

        for (let j = 0; j < comboColorsInKiai.length; ++j) {
          if (luminosity > luminosityMax && comboColorsInKiai[j] === i) {
            yield new LuminosityIssue({
              level: 'warning',
              message: `Combo color ${displayedColorIndex} is really bright in kiai sections. see ${TimestampFormatter.formatTimestamp(comboColorTime[j])}`,
              cause: 'Same as the first check, but lower than 43 instead.',
            });
          }
        }
      }
    }
  }
}

function asDisplayedComboColorIndex(beatmap: VerifierBeatmap<any>, zeroBasedIndex: number) {
  return zeroBasedIndex === 0 ? beatmap.colors.comboColors.length : zeroBasedIndex;
}
