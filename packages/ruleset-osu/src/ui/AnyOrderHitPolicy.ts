import type { DrawableHitObject, HitObjectContainer, HitResult, IHitPolicy } from '@osucad/common';
import { ClickAction } from './ClickAction';

export class AnyOrderHitPolicy implements IHitPolicy {
  hitObjectContainer!: HitObjectContainer;

  setHitObjectContainer(hitObjectContainer: HitObjectContainer): void {
    this.hitObjectContainer = hitObjectContainer;
  }

  checkHittable = (hitObject: DrawableHitObject, time: number, result: HitResult) => ClickAction.Hit;

  handleHit(hitObject: DrawableHitObject): void {
  }
}
