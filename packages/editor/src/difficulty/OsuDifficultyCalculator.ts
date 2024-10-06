import type { Beatmap } from '../beatmap/Beatmap.ts';
import type { DifficultyAttributes } from './DifficultyAttributes.ts';
import type { Skill } from './skills/Skill.ts';
import { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo.ts';
import { HitCircle } from '../beatmap/hitObjects/HitCircle.ts';

import { HitResult } from '../beatmap/hitObjects/HitResult.ts';
import { OsuHitWindows } from '../beatmap/hitObjects/OsuHitWindows.ts';
import { Slider } from '../beatmap/hitObjects/Slider.ts';
import { Spinner } from '../beatmap/hitObjects/Spinner.ts';
import { DifficultyCalculator } from './DifficultyCalculator.ts';
import { OsuDifficultyAttributes } from './OsuDifficultyAttributes.ts';
import { OsuPerformanceCalculator } from './OsuPerformanceCalculator.ts';
import { OsuDifficultyHitObject } from './preprocessing/OsuDifficultyHitObject.ts';
import { Aim } from './skills/Aim.ts';
import { OsuStrainSkill } from './skills/OsuStrainSkill.ts';
import { Speed } from './skills/Speed.ts';

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
      const lastLast = i > 1 ? beatmap.hitObjects.get(i - 2)! : null;
      objects.push(new OsuDifficultyHitObject(beatmap.hitObjects.get(i)!, beatmap.hitObjects.get(i - 1)!, lastLast, clockRate, objects, objects.length));
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
