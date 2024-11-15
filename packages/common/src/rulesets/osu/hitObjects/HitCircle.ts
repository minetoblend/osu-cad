import type { IVec2 } from 'osucad-framework';
import type { IPatchable } from '../../../commands/IPatchable';
import type { SerializedHitCircle } from '../../../serialization/HitObjects';
import { OsuHitObject } from './OsuHitObject';

export class HitCircle extends OsuHitObject implements IPatchable<SerializedHitCircle> {
  override contains(position: IVec2): boolean {
    return this.stackedPosition.distanceSq(position) <= this.radius * this.radius;
  }

  override isHitCircle(): this is HitCircle {
    return true;
  }
}
