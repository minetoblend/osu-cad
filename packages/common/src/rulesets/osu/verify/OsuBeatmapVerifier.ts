import type { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import { CheckDrainTime } from '../../../verifier/checks/compose/CheckDrainTime';
import { CheckAbnormalNodes } from './compose/CheckAbnormalNodes';
import { CheckAbnormalSpacing } from './compose/CheckAbnormalSpacing';
import { CheckAmbiguity } from './compose/CheckAmbiguity';
import { CheckBurai } from './compose/CheckBurai';
import { CheckConcurrent } from './compose/CheckConcurrent';
import { CheckInvisibleSlider } from './compose/CheckInvisibleSlider';
import { CheckNinjaSpinner } from './compose/CheckNinjaSpinner';
import { CheckObscuredReverse } from './compose/CheckObscuredReverse';
import { CheckMuted } from './hitsounds/CheckMuted';
import { CheckConcurrentControlPoints } from './settings/CheckConcurrentControlPoints';
import { CheckDefaultColors } from './settings/CheckDefaultColors';
import { CheckDifficultySettings } from './settings/CheckDifficultySettings';
import { CheckLuminosity } from './settings/CheckLuminosity';
import { CheckTickRate } from './settings/CheckTickRate';

export class OsuBeatmapVerifier extends BeatmapVerifier<OsuHitObject> {
  override get beatmapChecks(): BeatmapCheck<OsuHitObject>[] {
    return [
      new CheckAbnormalSpacing(),
      new CheckObscuredReverse(),
      new CheckNinjaSpinner(),
      new CheckBurai(),
      new CheckAmbiguity(),
      new CheckAbnormalNodes(),
      new CheckConcurrent(),
      new CheckDrainTime(),
      new CheckInvisibleSlider(),
      new CheckMuted(),
      new CheckDefaultColors(),
      new CheckDifficultySettings(),
      new CheckLuminosity(),
      new CheckTickRate(),
      new CheckConcurrentControlPoints(),
    ];
  }
}
