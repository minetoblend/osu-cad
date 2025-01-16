import type { DrawableHitObject, HitObjectContainer } from '@osucad/core';
import type { DrawableManiaHitObject } from '../objects/drawables/DrawableManiaHitObject';

export class OrderedHitPolicy {
  readonly #hitObjectContainer: HitObjectContainer;

  constructor(hitObjectContainer: HitObjectContainer) {
    this.#hitObjectContainer = hitObjectContainer;
  }

  isHittable = (hitObject: DrawableHitObject, time: number): boolean => {
    const objects = [...this.#hitObjectContainer.aliveObjects];
    const index = objects.indexOf(hitObject);
    if (index === -1 || index === objects.length - 1)
      return false;

    const nextObject = objects[index + 1];

    return time < nextObject.hitObject!.startTime;
  };

  handleHit(hitObject: DrawableHitObject) {
    for (const obj of this.#enumerateHitObjectsUpTo(hitObject.hitObject!.startTime)) {
      if (obj.judged)
        continue;

      (obj as DrawableManiaHitObject).missForcefully();
    }
  }

  * #enumerateHitObjectsUpTo(time: number) {
    for (const obj of this.#hitObjectContainer.aliveObjects) {
      if (obj.hitObject!.endTime > time)
        break;

      yield obj;

      for (const nestedObj of obj.nestedHitObjects) {
        if (nestedObj.hitObject!.endTime > time)
          break;

        yield nestedObj;
      }
    }
  }
}
