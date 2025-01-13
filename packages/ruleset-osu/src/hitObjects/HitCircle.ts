import type { IVec2 } from 'osucad-framework';
import { polymorphicHitObjectSerializers } from '@osucad/common';
import { OsuHitObject, OsuHitObjectSerializer } from './OsuHitObject';

export class HitCircle extends OsuHitObject {
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
    super('HitCircle');
  }

  protected override createInstance(): HitCircle {
    return new HitCircle();
  }
}

polymorphicHitObjectSerializers.set(HitCircle, new HitCircleSerializer());
