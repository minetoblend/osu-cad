import type { OsuDifficultyHitObject } from '../preprocessing/OsuDifficultyHitObject';
import { clamp } from 'osucad-framework';
import { Spinner } from '../../beatmap/hitObjects/Spinner';

const single_spacing_threshold = 125; // 1.25 circles distance between centers
const min_speed_bonus = 75; // ~200BPM
const speed_balancing_factor = 40;
const distance_multiplier = 0.94;

export class SpeedEvaluator {
  static evaluateDifficultyOf(current: OsuDifficultyHitObject) {
    if (current.baseObject instanceof Spinner)
      return 0;

    // derive strainTime for calculation
    const osuCurrObj = current;
    const osuPrevObj = current.index > 0 ? current.previous(0) : null;

    let strainTime = osuCurrObj.strainTime;
    const doubletapness = 1.0 - osuCurrObj.getDoubletapness(osuCurrObj.next(0));

    // Cap deltatime to the OD 300 hitwindow.
    // 0.93 is derived from making sure 260bpm OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of the cap.
    strainTime /= clamp((strainTime / osuCurrObj.hitWindowGreat) / 0.93, 0.92, 1);

    // speedBonus will be 0.0 for BPM < 200
    let speedBonus = 0.0;

    // Add additional scaling bonus for streams/bursts higher than 200bpm
    if (strainTime < min_speed_bonus)
      speedBonus = 0.75 * ((min_speed_bonus - strainTime) / speed_balancing_factor) ** 2;

    const travelDistance = osuPrevObj?.travelDistance ?? 0;
    let distance = travelDistance + osuCurrObj.minimumJumpDistance;

    // Cap distance at single_spacing_threshold
    distance = Math.min(distance, single_spacing_threshold);

    // Max distance bonus is 1 * `distance_multiplier` at single_spacing_threshold
    const distanceBonus = (distance / single_spacing_threshold) ** 3.95 * distance_multiplier;

    // Base difficulty with all bonuses
    const difficulty = (1 + speedBonus + distanceBonus) * 1000 / strainTime;

    // Apply penalty if there's doubletappable doubles
    return difficulty * doubletapness;
  }
}
