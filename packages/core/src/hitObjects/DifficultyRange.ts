import type { HitResult } from './HitResult';

export class DifficultyRange {
  constructor(
    readonly result: HitResult,
    readonly min: number,
    readonly average: number,
    readonly max: number,
  ) {
  }
}
