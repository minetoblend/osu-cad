import type { BeatmapCheck } from 'packages/common/src/verifier/BeatmapCheck';
import type { BeatmapSetCheck } from '../../../verifier/BeatmapSetCheck';
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
    ];
  }

  override get beatmapSetChecks(): BeatmapSetCheck[] {
    return [];
  }
}
