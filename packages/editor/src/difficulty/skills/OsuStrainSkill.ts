import type { OsuDifficultyHitObject } from '../preprocessing/OsuDifficultyHitObject.ts';
import { clamp, lerp } from 'osucad-framework';
import { StrainSkill } from './StrainSkill.ts';

export abstract class OsuStrainSkill extends StrainSkill<OsuDifficultyHitObject> {
  get reducedSectionCount() {
    return 10;
  }

  get reducedStrainBaseline() {
    return 0.75;
  }

  protected objectStrains: number[] = [];
  protected difficulty: number = 0;

  difficultyValue(): number {
    this.difficulty = 0;
    let weight = 1;

    // Sections with 0 strain are excluded to avoid worst-case time complexity of the following sort (e.g. /b/2351871).
    // These sections will not contribute to the difficulty.
    const peaks = this.getCurrentStrainPeaks().filter(p => p > 0);

    const strains = peaks.sort((a, b) => b - a);

    // We are reducing the highest strains first to account for extreme difficulty spikes
    for (let i = 0; i < Math.min(strains.length, this.reducedSectionCount); i++) {
      const scale = Math.log10(lerp(1, 10, clamp(i / this.reducedSectionCount, 0, 1)));
      strains[i] *= lerp(this.reducedStrainBaseline, 1.0, scale);
    }

    // Difficulty is the weighted sum of the highest strains from every section.
    // We're sorting from highest to lowest strain.
    for (const strain of strains.sort((a, b) => b - a)) {
      this.difficulty += strain * weight;
      weight *= this.decayWeight;
    }

    return this.difficulty;
  }

  countDifficultStrains() {
    if (this.difficulty === 0)
      return 0.0;

    const consistentTopStrain = this.difficulty / 10; // What would the top strain be if all strain values were identical
    // Use a weighted sum of all strains. Constants are arbitrary and give nice values
    return this.objectStrains
      .map(s => 1.1 / (1 + Math.exp(-10 * (s / consistentTopStrain - 0.88))))
      .reduce((acc, curr) => acc + curr, 0);
  }

  static difficultyToPerformance(difficulty: number) {
    return (5.0 * Math.max(1.0, difficulty / 0.0675) - 4.0) ** 3.0 / 100000.0;
  }
}
