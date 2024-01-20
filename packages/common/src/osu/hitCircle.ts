import {HitObject, HitObjectType} from "./hitObject";
import {SerializedHitCircle} from "../types";
import {Vec2} from "../math";
import {Additions, defaultHitSound, getSamples, HitSample, HitSound, SampleSet, SampleType} from "./hitSound";

export class HitCircle extends HitObject {

  readonly type = HitObjectType.Circle;

  constructor(options?: SerializedHitCircle) {
    super(options);
  }

  get duration() {
    return 0;
  }

  serialize(): SerializedHitCircle {
    return {
      id: this.id,
      type: "circle",
      position: this.position,
      newCombo: this.isNewCombo,
      startTime: this.startTime,
      comboOffset: this.comboOffset,
      attribution: this.attribution,
      hitSound: { ...this._hitSound },
    };
  }

  contains(point: Vec2): boolean {
    return Vec2.closerThan(this.stackedPosition, point, this.radius);
  }

  calculateHitSamples(): HitSample[] {
    return getSamples(this.hitSound, this.startTime);
  }

}