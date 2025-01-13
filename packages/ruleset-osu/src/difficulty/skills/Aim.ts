import type { OsuDifficultyHitObject } from '../preprocessing/OsuDifficultyHitObject';
import { AimEvaluator } from '../evaluators/AimEvaluator';
import { OsuStrainSkill } from './OsuStrainSkill';

export class Aim extends OsuStrainSkill {
  constructor(readonly withSliders = true) {
    super();
  }

  #currentStrain = 0;

  #skillMUltiplier = 25.18;

  #strainDecayBase = 0.15;

  #strainDecay(ms: number) {
    return this.#strainDecayBase ** (ms / 1000);
  }

  protected calculateInitialStrain(time: number, current: OsuDifficultyHitObject): number {
    return this.#currentStrain * this.#strainDecay(time - current.previous(0)!.startTime);
  }

  protected strainValueAt(current: OsuDifficultyHitObject): number {
    this.#currentStrain *= this.#strainDecay(current.deltaTime);
    this.#currentStrain += AimEvaluator.evaluateDifficultyOf(current, this.withSliders) * this.#skillMUltiplier;
    this.objectStrains.push(this.#currentStrain);

    return this.#currentStrain;
  }
}
