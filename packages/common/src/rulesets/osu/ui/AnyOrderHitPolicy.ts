import type { DrawableHitObject } from '../../../hitObjects/drawables/DrawableHitObject';
import type { HitResult } from '../../../hitObjects/HitResult';
import type { HitObjectContainer } from '../../ui/HitObjectContainer';
import type { IHitPolicy } from '../../ui/IHitPolicy';
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
