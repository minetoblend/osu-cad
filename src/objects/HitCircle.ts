import {HitObject} from "@/objects/HitObject";
import {SerializedHitCircle} from "@/networking/types";
import {Vec2} from "@/util/math";

export class HitCircle extends HitObject {


  serialize(): SerializedHitCircle {
    return {
      type: 'hitcircle',
      time: this.time,
      position: this.position.serialize(),
      uuid: ''
    }
  }

  contains(position: Vec2): boolean {
    return position.distanceTo(this.position) < 28;
  }
}