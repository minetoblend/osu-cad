import type { BeatmapCheck } from 'packages/common/src/verifier/BeatmapCheck';
import { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import { AbnormalSpacingCheck } from './AbnormalSpacingCheck';

export class OsuBeatmapVerifier extends BeatmapVerifier {
  override get checks(): BeatmapCheck[] {
    return [
      new AbnormalSpacingCheck(),
    ];
  }
}
