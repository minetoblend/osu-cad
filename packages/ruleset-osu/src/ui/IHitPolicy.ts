import type { DrawableHitObject, HitObjectContainer, HitResult } from '@osucad/core';
import type { ClickAction } from './ClickAction';

export interface IHitPolicy {
  setHitObjectContainer(hitObjectContainer: HitObjectContainer): void;

  checkHittable: (hitObject: DrawableHitObject, time: number, result: HitResult) => ClickAction;

  handleHit(hitObject: DrawableHitObject): void;
}
