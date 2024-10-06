import { BeatmapDifficultyInfo } from '../BeatmapDifficultyInfo.ts';
import { DifficultyRange } from './DifficultyRange.ts';
import { HitResult } from './HitResult.ts';

export class HitWindows {
  static readonly base_ranges = [
    new DifficultyRange(HitResult.Perfect, 22.4, 19.4, 13.9),
    new DifficultyRange(HitResult.Great, 64, 49, 34),
    new DifficultyRange(HitResult.Good, 97, 82, 67),
    new DifficultyRange(HitResult.Ok, 127, 112, 97),
    new DifficultyRange(HitResult.Meh, 151, 136, 121),
    new DifficultyRange(HitResult.Miss, 188, 173, 158),
  ];

  #perfect: number = 0;
  #great: number = 0;
  #good: number = 0;
  #ok: number = 0;
  #meh: number = 0;
  #miss: number = 0;

  protected lowestSuccessfulHitResult(): HitResult {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; result++) {
      if (this.isHitResultAllowed(result))
        return result;
    }

    return HitResult.None;
  }

  * getAvailableWindows() {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; result++) {
      if (this.isHitResultAllowed(result))
        yield result;
    }
  }

  isHitResultAllowed(result: HitResult): boolean {
    return true;
  }

  setDifficulty(difficulty: number) {
    for (const range of this.getRanges()) {
      const value = BeatmapDifficultyInfo.difficultyRange(difficulty, range.min, range.average, range.max);

      switch (range.result) {
        case HitResult.Miss:
          this.#miss = value;
          break;

        case HitResult.Meh:
          this.#meh = value;
          break;

        case HitResult.Ok:
          this.#ok = value;
          break;

        case HitResult.Good:
          this.#good = value;
          break;

        case HitResult.Great:
          this.#great = value;
          break;

        case HitResult.Perfect:
          this.#perfect = value;
          break;
      }
    }
  }

  resultFor(timeOffset: number) {
    timeOffset = Math.abs(timeOffset);

    for (let result = HitResult.Perfect; result >= HitResult.Miss; --result) {
      if (this.isHitResultAllowed(result) && timeOffset <= this.windowFor(result))
        return result;
    }

    return HitResult.None;
  }

  windowFor(result: HitResult) {
    switch (result) {
      case HitResult.Perfect:
        return this.#perfect;

      case HitResult.Great:
        return this.#great;

      case HitResult.Good:
        return this.#good;

      case HitResult.Ok:
        return this.#ok;

      case HitResult.Meh:
        return this.#meh;

      case HitResult.Miss:
        return this.#miss;

      default:
        throw new Error(`Unknown enum member ${result}`);
    }
  }

  canBeHit(timeOffset: number) {
    return timeOffset <= this.windowFor(this.lowestSuccessfulHitResult());
  }

  getRanges(): DifficultyRange[] {
    return HitWindows.base_ranges;
  }
}
