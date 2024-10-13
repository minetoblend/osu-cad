import type { HitResult } from '../../beatmap/hitObjects/HitResult';
import type { ClickAction } from './ClickAction';
import type { DrawableHitObject } from './DrawableHitObject';
import type { HitObjectContainer } from './HitObjectContainer';

export interface IHitPolicy {
  setHitObjectContainer(hitObjectContainer: HitObjectContainer): void;

  checkHittable: (hitObject: DrawableHitObject, time: number, result: HitResult) => ClickAction;

  handleHit(hitObject: DrawableHitObject): void;
}
