import type { IVec2 } from 'osucad-framework';
import type { IPatchable } from '../../editor/commands/IPatchable';
import type { SerializedHitCircle } from '../serialization/HitObjects';
import { HitCirclePatchEncoder } from '../../editor/commands/patchEncoder/HitCirclePatchEncoder';
import { OsuHitObject } from './OsuHitObject';

export class HitCircle extends OsuHitObject implements IPatchable<SerializedHitCircle> {
  contains(position: IVec2): boolean {
    return this.stackedPosition.distanceSq(position) <= this.radius * this.radius;
  }

  createPatchEncoder() {
    return new HitCirclePatchEncoder(this);
  }

  isHitCircle(): this is HitCircle {
    return true;
  }
}
