import type { DifficultyHitObject } from '../preprocessing/DifficultyHitObject.ts';

export abstract class Skill<T extends DifficultyHitObject<any>> {
  abstract process(current: T): void;

  abstract difficultyValue(): number;
}
