import type { BeatmapCheck } from 'packages/common/src/verifier/BeatmapCheck';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import { CheckAbnormalSpacing } from './CheckAbnormalSpacing';
import { CheckAmbiguity } from './CheckAmbiguity';
import { CheckBurai } from './CheckBurai';
import { CheckNinjaSpinner } from './CheckNinjaSpinner';
import { CheckObscuredReverse } from './CheckObscuredReverse';

export class OsuBeatmapVerifier extends BeatmapVerifier<OsuHitObject> {
  override get checks(): BeatmapCheck<OsuHitObject>[] {
    return [
      new CheckAbnormalSpacing(),
      new CheckObscuredReverse(),
      new CheckNinjaSpinner(),
      new CheckBurai(),
      new CheckAmbiguity(),
    ];
  }
}
