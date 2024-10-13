import type { HitResult } from '../../beatmap/hitObjects/HitResult.ts';
import type { ClickAction } from './ClickAction.ts';
import type { DrawableHitObject } from './DrawableHitObject.ts';
import type { HitObjectContainer } from './HitObjectContainer.ts';

export interface IHitPolicy {
  setHitObjectContainer(hitObjectContainer: HitObjectContainer): void;

  checkHittable: (hitObject: DrawableHitObject, time: number, result: HitResult) => ClickAction;

  handleHit(hitObject: DrawableHitObject): void;
}
