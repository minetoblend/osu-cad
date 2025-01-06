import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { BeatmapSettings } from '../beatmap/BeatmapSettings';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { FileStore } from '../beatmap/io/FileStore';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';

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
