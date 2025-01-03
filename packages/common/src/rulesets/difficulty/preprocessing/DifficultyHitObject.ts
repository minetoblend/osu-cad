import type { HitObject } from '@osucad/common';

export abstract class DifficultyHitObject<T extends HitObject> {
  protected constructor(
    hitObject: T,
    readonly lastObject: T,
    readonly clockRate: number,
    readonly hitObjects: DifficultyHitObject<T>[],
    readonly index: number,
  ) {
    this.baseObject = hitObject;
    this.deltaTime = (hitObject.startTime - lastObject.startTime) / clockRate;
    this.startTime = hitObject.startTime / clockRate;
    this.endTime = hitObject.endTime / clockRate;
  }

  readonly baseObject: T;

  readonly deltaTime: number;

  readonly startTime: number;

  readonly endTime: number;

  previous(backwardsIndex: number): DifficultyHitObject<T> | null {
    const index = this.index - (backwardsIndex + 1);
    return index >= 0 && index < this.hitObjects.length ? this.hitObjects[index] : null;
  }

  next(forwardsIndex: number): DifficultyHitObject<T> | null {
    const index = this.index + (forwardsIndex + 1);
    return index >= 0 && index < this.hitObjects.length ? this.hitObjects[index] : null;
  }
}
