import { DifficultyRange } from './DifficultyRange';
import { HitResult } from './HitResult';
import { HitWindows } from './HitWindows';

export class OsuHitWindows extends HitWindows {
  static readonly MISS_WINDOW = 400;

  static readonly OSU_RANGES: DifficultyRange[] = [
    new DifficultyRange(HitResult.Great, 80, 50, 20),
    new DifficultyRange(HitResult.Ok, 140, 100, 60),
    new DifficultyRange(HitResult.Meh, 200, 150, 100),
    new DifficultyRange(HitResult.Miss, this.MISS_WINDOW, this.MISS_WINDOW, this.MISS_WINDOW),
  ];

  isHitResultAllowed(result: HitResult): boolean {
    switch (result) {
      case HitResult.Great:
      case HitResult.Ok:
      case HitResult.Meh:
      case HitResult.Miss:
        return true;
      default:
        return false;
    }
  }

  getRanges(): DifficultyRange[] {
    return OsuHitWindows.OSU_RANGES;
  }
}
