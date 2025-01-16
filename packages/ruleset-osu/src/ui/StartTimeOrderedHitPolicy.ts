import type { DrawableHitObject, HitObjectContainer } from '@osucad/core';
import type { DrawableOsuHitObject } from '../hitObjects/drawables/DrawableOsuHitObject';
import type { IHitPolicy } from './IHitPolicy';
import { HitResult } from '@osucad/core';
import { DrawableHitCircle } from '../hitObjects/drawables/DrawableHitCircle';
import { ClickAction } from './ClickAction';

export class StartTimeOrderedHitPolicy implements IHitPolicy {
  hitObjectContainer: HitObjectContainer | null = null;

  setHitObjectContainer(hitObjectContainer: HitObjectContainer): void {
    this.hitObjectContainer = hitObjectContainer;
  }

  checkHittable = (hitObject: DrawableHitObject, time: number, result: HitResult) => {
    if (!this.hitObjectContainer)
      throw new Error('HitObjectContainer not set');

    let blockingObject: DrawableHitObject | null = null;

    for (const obj of this.#enumerateHitObjectsUpTo(hitObject.hitObject!.startTime)) {
      if (this.#hitObjectCanBlockFutureHits(obj))
        blockingObject = obj;
    }

    if (blockingObject == null)
      return ClickAction.Hit;

    return (blockingObject.judged || time >= blockingObject.hitObject!.startTime) ? ClickAction.Hit : ClickAction.Shake;
  };

  #hitObjectCanBlockFutureHits(hitObject: DrawableHitObject): boolean {
    return hitObject instanceof DrawableHitCircle;
  }

  * #enumerateHitObjectsUpTo(targetTime: number): IterableIterator<DrawableHitObject> {
    if (!this.hitObjectContainer)
      throw new Error('HitObjectContainer not set');

    for (const obj of this.hitObjectContainer.aliveObjects) {
      if (obj.hitObject!.startTime >= targetTime)
        break;

      yield obj;

      for (const nestedObj of obj.nestedHitObjects) {
        if (nestedObj.hitObject!.startTime >= targetTime)
          break;

        yield nestedObj;
      }
    }
  }

  handleHit(hitObject: DrawableHitObject): void {
    if (!this.hitObjectContainer)
      throw new Error('HitObjectContainer not set');

    // Hitobjects which themselves don't block future hitobjects don't cause misses (e.g. slider ticks, spinners).
    if (!this.#hitObjectCanBlockFutureHits(hitObject))
      return;

    if (this.checkHittable(hitObject, hitObject.hitObject!.startTime + (hitObject.result?.timeOffset ?? 0), hitObject.result?.type ?? HitResult.None) !== ClickAction.Hit)
      throw new Error('A hitObject was hit before it became hittable!');

    // Miss all hitobjects prior to the hit one.
    for (const obj of this.#enumerateHitObjectsUpTo(hitObject.hitObject!.startTime)) {
      if (obj.judged)
        continue;

      if (this.#hitObjectCanBlockFutureHits(obj))
        (obj as DrawableOsuHitObject).missForcefully();
    }
  }
}
