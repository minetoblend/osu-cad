import type { DrawableHitObject } from '../../hitObjects/drawables/DrawableHitObject';
import type { HitResult } from '../../hitObjects/HitResult';
import type { ClickAction } from '../osu/ui/ClickAction';
import type { HitObjectContainer } from './HitObjectContainer';

export interface IHitPolicy {
  setHitObjectContainer(hitObjectContainer: HitObjectContainer): void;

  checkHittable: (hitObject: DrawableHitObject, time: number, result: HitResult) => ClickAction;

  handleHit(hitObject: DrawableHitObject): void;
}
