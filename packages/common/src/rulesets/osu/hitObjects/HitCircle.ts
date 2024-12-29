import type { IVec2 } from 'osucad-framework';
import type { IPatchable } from '../../../commands/IPatchable';
import type { SerializedHitCircle } from '../../../serialization/HitObjects';
import { polymorphicHitObjectSerializers } from '../../../hitObjects/HitObject';
import { OsuHitObject, OsuHitObjectSerializer } from './OsuHitObject';

export class HitCircle extends OsuHitObject implements IPatchable<SerializedHitCircle> {
  override contains(position: IVec2): boolean {
    return this.stackedPosition.distanceSq(position) <= this.radius * this.radius;
  }

  override isHitCircle(): this is HitCircle {
    return true;
  }

  static get serializer() {
    return new HitCircleSerializer();
  }
}

export class HitCircleSerializer extends OsuHitObjectSerializer<HitCircle> {
  constructor() {
    super('HitCircle', {});
  }

  protected override createInstance(): HitCircle {
    return new HitCircle();
  }
}

polymorphicHitObjectSerializers.set(HitCircle, new HitCircleSerializer());
