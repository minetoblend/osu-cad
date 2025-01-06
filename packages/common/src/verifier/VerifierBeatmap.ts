import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { BeatmapSettings } from '../beatmap/BeatmapSettings';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';

export enum DifficultyType {
  Easy,
  Normal,
  Hard,
  Insane,
  Expert,
  Ultra,
}

export class VerifierBeatmap<T extends HitObject = HitObject> implements IBeatmap<T> {
  constructor(
    readonly beatmap: Beatmap<T>,
    readonly files: FileStore,
  ) {

  }

  #starRating?: number | null;

  get starRating(): number | null {
    this.calculateStarRating();
    return this.#starRating as number | null;
  }

  getDifficulty(considerName = false) {
    let difficulty: DifficultyType | null = null;

    const starRating = this.starRating;

    if (starRating !== null) {
      if (starRating < 2.0)
        difficulty = DifficultyType.Easy;
      else if (starRating < 2.7)
        difficulty = DifficultyType.Normal;
      else if (starRating < 4.0)
        difficulty = DifficultyType.Hard;
      else if (starRating < 5.3)
        difficulty = DifficultyType.Insane;
      else if (starRating < 6.5)
        difficulty = DifficultyType.Expert;
      else difficulty = DifficultyType.Ultra;
    }

    if (!considerName)
      return difficulty;

    return this.getDifficultyFromName() ?? difficulty;
  }

  #nameDiffPairs: [DifficultyType, string[]][] = [
    [DifficultyType.Easy, ['Beginner', 'Easy', 'Novice']],
    [DifficultyType.Normal, ['Basic', 'Normal', 'Medium', 'Intermediate']],
    [DifficultyType.Hard, ['Advanced', 'Hard']],
    [DifficultyType.Insane, ['Hyper', 'Insane']],
    [DifficultyType.Expert, ['Expert', 'Extra', 'Extreme']],
  ];

  getDifficultyFromName() {
    const name = this.metadata.difficultyName.toLowerCase();

    const pairs = this.#nameDiffPairs.toReversed();

    for (const [type, names] of pairs) {
    // Allows difficulty names such as "Normal...!??" and ">{(__HARD;)}" to be detected,
    // but still prevents "Normality" or similar inclusions.

      if (names.some(it => new RegExp(String.raw`(^| )[!-@\\[-\`{{-~]*${it}[!-@\\[-\`{{-~]*( |$)`, 'i').test(name)))
        return type;
    }

    return null;
  }

  calculateStarRating() {
    if (this.#starRating === undefined) {
      const difficultyCalculator = this.beatmap.ruleset?.createDifficultyCalculator(this.beatmap as Beatmap<any>);
      if (difficultyCalculator) {
        const [{ starRating }] = difficultyCalculator.calculate();
        this.#starRating = starRating;
      }
      else {
        this.#starRating = null;
      }
    }
  }

  get settings(): BeatmapSettings {
    return this.beatmap.settings;
  }

  get metadata(): BeatmapMetadata {
    return this.beatmap.metadata;
  }

  get difficulty(): BeatmapDifficultyInfo {
    return this.beatmap.difficulty;
  }

  get colors(): BeatmapColors {
    return this.beatmap.colors;
  }

  get controlPoints(): ControlPointInfo {
    return this.beatmap.controlPoints;
  }

  get hitObjects() {
    return this.beatmap.hitObjects;
  }
}
