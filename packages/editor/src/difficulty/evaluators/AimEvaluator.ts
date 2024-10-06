import type { OsuDifficultyHitObject } from '../preprocessing/OsuDifficultyHitObject.ts';
import { clamp } from 'osucad-framework';
import { Slider } from '../../beatmap/hitObjects/Slider.ts';
import { Spinner } from '../../beatmap/hitObjects/Spinner.ts';

const wide_angle_multiplier = 1.5;
const acute_angle_multiplier = 1.95;
const slider_multiplier = 1.35;
const velocity_change_multiplier = 0.75;

export class AimEvaluator {
  static evaluateDifficultyOf(current: OsuDifficultyHitObject, withSliderTravelDistance: boolean): number {
    if (current.baseObject instanceof Spinner || current.index <= 1 || (current.previous(0)!.baseObject instanceof Spinner))
      return 0;

    const osuCurrObj = current;
    const osuLastObj = current.previous(0)!;
    const osuLastLastObj = current.previous(1);

    // Calculate the velocity to the current hitobject, which starts with a base distance / time assuming the last object is a hitcircle.
    let currVelocity = osuCurrObj.lazyJumpDistance / osuCurrObj.strainTime;

    // But if the last object is a slider, then we extend the travel velocity through the slider into the current object.
    if (osuLastObj.baseObject instanceof Slider && withSliderTravelDistance) {
      const travelVelocity = osuLastObj.travelDistance / osuLastObj.travelTime; // calculate the slider velocity from slider head to slider end.
      const movementVelocity = osuCurrObj.minimumJumpDistance / osuCurrObj.minimumJumpTime; // calculate the movement velocity from slider end to current object

      currVelocity = Math.max(currVelocity, movementVelocity + travelVelocity); // take the larger total combined velocity.
    }

    // As above, do the same for the previous hitobject.
    let prevVelocity = osuLastObj.lazyJumpDistance / osuLastObj.strainTime;

    if (osuLastLastObj && osuLastLastObj.baseObject instanceof Slider && withSliderTravelDistance) {
      const travelVelocity = osuLastLastObj!.travelDistance / osuLastLastObj.travelTime;
      const movementVelocity = osuLastObj!.minimumJumpDistance / osuLastObj.minimumJumpTime;

      prevVelocity = Math.max(prevVelocity, movementVelocity + travelVelocity);
    }

    let wideAngleBonus = 0;
    let acuteAngleBonus = 0;
    let sliderBonus = 0;
    let velocityChangeBonus = 0;

    let aimStrain = currVelocity; // Start strain with regular velocity.

    // If rhythms are the same.
    if (Math.max(osuCurrObj.strainTime, osuLastObj.strainTime) < 1.25 * Math.min(osuCurrObj.strainTime, osuLastObj.strainTime)) {
      if (osuCurrObj.angle != null && osuLastObj.angle != null && osuLastLastObj && osuLastLastObj.angle != null) {
        const currAngle = osuCurrObj.angle;
        const lastAngle = osuLastObj.angle;
        const lastLastAngle = osuLastLastObj.angle;

        // Rewarding angles, take the smaller velocity as base.
        const angleBonus = Math.min(currVelocity, prevVelocity);

        wideAngleBonus = this.calcWideAngleBonus(currAngle);
        acuteAngleBonus = this.calcAcuteAngleBonus(currAngle);

        if (osuCurrObj.strainTime > 100) { // Only buff deltaTime exceeding 300 bpm 1/2.
          acuteAngleBonus = 0;
        }
        else {
          acuteAngleBonus *= this.calcAcuteAngleBonus(lastAngle) // Multiply by previous angle, we don't want to buff unless this is a wiggle type pattern.
          * Math.min(angleBonus, 125 / osuCurrObj.strainTime) // The maximum velocity we buff is equal to 125 / strainTime
          * Math.sin(Math.PI / 2 * Math.min(1, (100 - osuCurrObj.strainTime) / 25)) ** 2 // scale buff from 150 bpm 1/4 to 200 bpm 1/4
          * Math.sin(Math.PI / 2 * (clamp(osuCurrObj.lazyJumpDistance, 50, 100) - 50) / 50) ** 2; // Buff distance exceeding 50 (radius) up to 100 (diameter).
        }

        // Penalize wide angles if they're repeated, reducing the penalty as the lastAngle gets more acute.
        wideAngleBonus *= angleBonus * (1 - Math.min(wideAngleBonus, this.calcWideAngleBonus(lastAngle) ** 3));
        // Penalize acute angles if they're repeated, reducing the penalty as the lastLastAngle gets more obtuse.
        acuteAngleBonus *= 0.5 + 0.5 * (1 - Math.min(acuteAngleBonus, this.calcAcuteAngleBonus(lastLastAngle) ** 3));
      }
    }

    if (Math.max(prevVelocity, currVelocity) !== 0) {
      // We want to use the average velocity over the whole object when awarding differences, not the individual jump and slider path velocities.
      prevVelocity = (osuLastObj.lazyJumpDistance + osuLastLastObj!.travelDistance) / osuLastObj.strainTime;
      currVelocity = (osuCurrObj.lazyJumpDistance + osuLastObj.travelDistance) / osuCurrObj.strainTime;

      // Scale with ratio of difference compared to 0.5 * max dist.
      const distRatio = Math.sin(Math.PI / 2 * Math.abs(prevVelocity - currVelocity) / Math.max(prevVelocity, currVelocity)) ** 2;

      // Reward for % distance up to 125 / strainTime for overlaps where velocity is still changing.
      const overlapVelocityBuff = Math.min(125 / Math.min(osuCurrObj.strainTime, osuLastObj.strainTime), Math.abs(prevVelocity - currVelocity));

      velocityChangeBonus = overlapVelocityBuff * distRatio;

      // Penalize for rhythm changes.
      velocityChangeBonus *= (Math.min(osuCurrObj.strainTime, osuLastObj.strainTime) / Math.max(osuCurrObj.strainTime, osuLastObj.strainTime)) ** 2;
    }

    if (osuLastObj.baseObject instanceof Slider) {
      // Reward sliders based on velocity.
      sliderBonus = osuLastObj.travelDistance / osuLastObj.travelTime;
    }

    // Add in acute angle bonus or wide angle bonus + velocity change bonus, whichever is larger.
    aimStrain += Math.max(acuteAngleBonus * acute_angle_multiplier, wideAngleBonus * wide_angle_multiplier + velocityChangeBonus * velocity_change_multiplier);

    // Add in additional slider velocity bonus.
    if (withSliderTravelDistance)
      aimStrain += sliderBonus * slider_multiplier;

    return aimStrain;
  }

  private static calcWideAngleBonus(angle: number) {
    return Math.sin(3.0 / 4 * (Math.min(5.0 / 6 * Math.PI, Math.max(Math.PI / 6, angle)) - Math.PI / 6)) ** 2;
  }

  private static calcAcuteAngleBonus(angle: number) {
    return 1 - this.calcWideAngleBonus(angle);
  }
}
