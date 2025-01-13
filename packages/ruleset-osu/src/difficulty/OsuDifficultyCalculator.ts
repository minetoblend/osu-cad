import type { Beatmap, DifficultyAttributes, Skill } from '@osucad/common';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { BeatmapDifficultyInfo, DifficultyCalculator, HitResult } from '@osucad/common';
import { HitCircle } from '../hitObjects/HitCircle';
import { OsuHitWindows } from '../hitObjects/OsuHitWindows';
import { Slider } from '../hitObjects/Slider';
import { Spinner } from '../hitObjects/Spinner';
import { OsuDifficultyAttributes } from './OsuDifficultyAttributes';
import { OsuPerformanceCalculator } from './OsuPerformanceCalculator';
import { OsuDifficultyHitObject } from './preprocessing/OsuDifficultyHitObject';
import { Aim } from './skills/Aim';
import { OsuStrainSkill } from './skills/OsuStrainSkill';
import { Speed } from './skills/Speed';

const difficulty_multiplier = 0.0675;

export class OsuDifficultyCalculator extends DifficultyCalculator<OsuDifficultyHitObject> {
  constructor(beatmap: Beatmap) {
    super(beatmap);
  }

  protected createDifficultyAttributes(beatmap: Beatmap, skills: Skill<OsuDifficultyHitObject>[], clockRate: number): DifficultyAttributes {
    if (beatmap.hitObjects.length === 0)
      return new OsuDifficultyAttributes();

    const aimRating = Math.sqrt(skills[0].difficultyValue()) * difficulty_multiplier;
    const aimRatingNoSliders = Math.sqrt(skills[1].difficultyValue()) * difficulty_multiplier;
    const speedRating = Math.sqrt(skills[2].difficultyValue()) * difficulty_multiplier;
    const speedNotes = (skills[2] as Speed).relevantNoteCount();

    const sliderFactor = aimRating > 0 ? aimRatingNoSliders / aimRating : 1;

    const aimDifficultyStrainCount = (skills[0] as OsuStrainSkill).countDifficultStrains();
    const speedDifficultyStrainCount = (skills[2] as OsuStrainSkill).countDifficultStrains();

    const baseAimPerformance = OsuStrainSkill.difficultyToPerformance(aimRating);
    const baseSpeedPerformance = OsuStrainSkill.difficultyToPerformance(speedRating);

    const basePerformance = (baseAimPerformance ** 1.1 + baseSpeedPerformance ** 1.1) ** (1.0 / 1.1);

    const starRating = basePerformance > 0.00001
      ? Math.cbrt(OsuPerformanceCalculator.PERFORMANCE_BASE_MULTIPLIER) * 0.027 * (Math.cbrt(100000 / 2 ** (1 / 1.1) * basePerformance) + 4)
      : 0;

    const preempt = BeatmapDifficultyInfo.difficultyRange(beatmap.difficulty.approachRate, 1800, 1200, 450) / clockRate;
    const drainRate = beatmap.difficulty.hpDrainRate;
    const maxCombo = beatmap.getMaxCombo();

    const hitCirclesCount = beatmap.hitObjects.filter(h => h instanceof HitCircle).length;
    const sliderCount = beatmap.hitObjects.filter(h => h instanceof Slider).length;
    const spinnerCount = beatmap.hitObjects.filter(h => h instanceof Spinner).length;

    const hitWindows = new OsuHitWindows();
    hitWindows.setDifficulty(beatmap.difficulty.overallDifficulty);

    const hitWindowGreat = hitWindows.windowFor(HitResult.Great) / clockRate;

    const attributes = new OsuDifficultyAttributes();

    attributes.starRating = starRating;
    attributes.aimDifficulty = aimRating;
    attributes.speedDifficulty = speedRating;
    attributes.speedNoteCount = speedNotes;
    attributes.sliderFactor = sliderFactor;
    attributes.aimDifficultStrainCount = aimDifficultyStrainCount;
    attributes.approachRate = preempt > 1200 ? (1800 - preempt) / 120 : (1200 - preempt) / 150 + 5;
    attributes.overallDifficulty = (80 - hitWindowGreat) / 6;
    attributes.drainRate = drainRate;
    attributes.maxCombo = maxCombo;
    attributes.hitCircleCount = hitCirclesCount;
    attributes.sliderCount = sliderCount;
    attributes.spinnerCount = spinnerCount;

    return attributes;
  }

  protected createDifficultyHitObjects(beatmap: Beatmap, clockRate: number): OsuDifficultyHitObject[] {
    const objects: OsuDifficultyHitObject[] = [];

    // The first jump is formed by the first two hitobjects of the map.
    // If the map has less than two OsuHitObjects, the enumerator will not return anything.
    for (let i = 1; i < beatmap.hitObjects.length; i++) {
      const lastLast = i > 1 ? beatmap.hitObjects.items[i - 2]! : null;
      objects.push(new OsuDifficultyHitObject(
        beatmap.hitObjects.items[i] as OsuHitObject,
        beatmap.hitObjects.items[i - 1] as OsuHitObject,
        lastLast as OsuHitObject | null,
        clockRate,
        objects,
        objects.length,
      ));
    }

    return objects;
  }

  protected createSkills(beatmap: Beatmap, clockRate: number): Skill<OsuDifficultyHitObject>[] {
    return [
      new Aim(true),
      new Aim(false),
      new Speed(),
    ];
  }
}
