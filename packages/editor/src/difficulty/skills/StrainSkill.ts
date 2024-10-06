import type { DifficultyHitObject } from '../preprocessing/DifficultyHitObject.ts';
import { Skill } from './Skill.ts';

export abstract class StrainSkill<T extends DifficultyHitObject<any>> extends Skill<T> {
  protected get decayWeight() {
    return 0.9;
  }

  protected get sectionLength() {
    return 400;
  }

  #currentSectionPeak = 0;

  #currentSectionEnd = 0;

  #strainPeaks: number[] = [];

  protected abstract strainValueAt(current: T): number;

  process(current: T) {
    // The first object doesn't generate a strain, so we begin with an incremented section end
    if (current.index === 0)
      this.#currentSectionEnd = Math.ceil(current.startTime / this.sectionLength) * this.sectionLength;

    while (current.startTime > this.#currentSectionEnd) {
      this.#saveCurrentPeak();
      this.#startNewSectionFrom(this.#currentSectionEnd, current);
      this.#currentSectionEnd += this.sectionLength;
    }

    this.#currentSectionPeak = Math.max(this.strainValueAt(current), this.#currentSectionPeak);
  }

  #saveCurrentPeak() {
    this.#strainPeaks.push(this.#currentSectionPeak);
  }

  #startNewSectionFrom(time: number, current: T) {
    this.#currentSectionPeak = this.calculateInitialStrain(time, current);
  }

  protected abstract calculateInitialStrain(time: number, current: T): number;

  getCurrentStrainPeaks() {
    return [...this.#strainPeaks, this.#currentSectionPeak];
  }

  difficultyValue(): number {
    let difficulty = 0;
    let weight = 1;

    // Sections with 0 strain are excluded to avoid worst-case time complexity of the following sort (e.g. /b/2351871).
    // These sections will not contribute to the difficulty.
    const peaks = this.getCurrentStrainPeaks().filter(p => p > 0);

    // Difficulty is the weighted sum of the highest strains from every section.
    // We're sorting from highest to lowest strain.
    for (const strain of peaks.sort((a, b) => b - a)) {
      difficulty += strain * weight;
      weight *= this.decayWeight;
    }

    return difficulty;
  }
}
