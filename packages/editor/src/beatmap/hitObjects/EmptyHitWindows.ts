import { DifficultyRange } from './DifficultyRange';
import { HitResult } from './HitResult';
import { HitWindows } from './HitWindows';

export class EmptyHitWindows extends HitWindows {
  private static readonly ranges: DifficultyRange[] = [
    new DifficultyRange(HitResult.Perfect, 0, 0, 0),
    new DifficultyRange(HitResult.Miss, 0, 0, 0),
  ];

  isHitResultAllowed(result: HitResult): boolean {
    switch (result) {
      case HitResult.Perfect:
      case HitResult.Miss:
        return true;
      default:
        return false;
    }
  }

  getRanges(): DifficultyRange[] {
    return EmptyHitWindows.ranges;
  }
}
