import type { IVec2 } from '@osucad/framework';
import { OsuHitObject } from './OsuHitObject';

export class HitCircle extends OsuHitObject {
  override contains(position: IVec2): boolean {
    return this.stackedPosition.distanceSq(position) <= this.radius * this.radius;
  }

  override isHitCircle(): this is HitCircle {
    return true;
  }
}
