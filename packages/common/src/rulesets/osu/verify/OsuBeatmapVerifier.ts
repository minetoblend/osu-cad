import type { BeatmapCheck } from 'packages/common/src/verifier/BeatmapCheck';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import { AbnormalSpacingCheck } from './AbnormalSpacingCheck';

export class OsuBeatmapVerifier extends BeatmapVerifier<OsuHitObject> {
  override get checks(): BeatmapCheck<OsuHitObject>[] {
    return [
      new AbnormalSpacingCheck(),
    ];
  }
}
