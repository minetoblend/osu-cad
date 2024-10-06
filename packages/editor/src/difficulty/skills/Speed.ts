import type { OsuDifficultyHitObject } from '../preprocessing/OsuDifficultyHitObject.ts';
import { RhythmEvaluator } from '../evaluators/RhythmEvaluator.ts';
import { SpeedEvaluator } from '../evaluators/SpeedEvaluator.ts';
import { OsuStrainSkill } from './OsuStrainSkill.ts';

export class Speed extends OsuStrainSkill {
  #skillMultiplier = 1.430;
  #strainDecayBase = 0.3;

  #currentStrain = 0;
  #currentRhythm = 0;

  override get reducedSectionCount(): number {
    return 5;
  }

  #strainDecay(ms: number) {
    return this.#strainDecayBase ** (ms / 1000);
  }

  protected calculateInitialStrain(time: number, current: OsuDifficultyHitObject): number {
    return (this.#currentStrain * this.#currentRhythm) * this.#strainDecay(time - current.previous(0)!.startTime);
  }

  protected strainValueAt(current: OsuDifficultyHitObject): number {
    this.#currentStrain *= this.#strainDecay((current).strainTime);
    this.#currentStrain += SpeedEvaluator.evaluateDifficultyOf(current) * this.#skillMultiplier;

    this.#currentRhythm = RhythmEvaluator.evaluateDifficultyOf(current);

    const totalStrain = this.#currentStrain * this.#currentRhythm;
    this.objectStrains.push(totalStrain);

    return totalStrain;
  }

  relevantNoteCount() {
    if (this.objectStrains.length === 0)
      return 0;

    const maxStrain = this.objectStrains.reduce((acc, curr) => Math.max(acc, curr), 0);

    if (maxStrain === 0)
      return 0;

    return this.objectStrains
      .map(strain => 1.0 / (1.0 + Math.exp(-(strain / maxStrain * 12.0 - 6.0))))
      .reduce((a, b) => a + b);
  }
}
