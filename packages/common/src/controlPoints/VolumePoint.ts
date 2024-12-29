// @ts-expect-error looks like someone fucked up the types
import BezierEasing from 'bezier-easing';
import { almostEquals, clamp, lerp, Vec2 } from 'osucad-framework';
import { ControlPoint } from './ControlPoint';

export enum VolumeCurveType {
  Constant,
  Smooth,
}

export class VolumePoint extends ControlPoint {
  constructor(time: number, volume: number = 100) {
    super(time);
    this.volume = volume;
  }

  static default = new VolumePoint(0, 100);

  #volume = this.property('volume', 100);

  get volumeBindable() {
    return this.#volume.bindable;
  }

  get volume() {
    return this.#volume.value;
  }

  set volume(value: number) {
    this.#volume.value = value;
  }

  #curveType = this.property('curveType', VolumeCurveType.Constant);

  get curveTypeBindable() {
    return this.#curveType.bindable;
  }

  get curveType() {
    return this.#curveType.value;
  }

  set curveType(value: VolumeCurveType) {
    this.#curveType.value = value;
  }

  #p1 = this.property('p1', new Vec2(0.333));

  get p1Bindable() {
    return this.#p1.bindable;
  }

  get p1() {
    return this.#p1.value;
  }

  set p1(value) {
    this.#p1.value = value;
  }

  #p2 = this.property('p2', new Vec2(0.666));

  get p2Bindable() {
    return this.#p2.bindable;
  }

  get p2() {
    return this.#p2.value;
  }

  set p2(value) {
    this.#p2.value = value;
  }

  get isLinear() {
    return almostEquals(this.p1.x, this.p1.y) && almostEquals(this.p2.x, this.p2.y);
  }

  volumeAtTime(time: number, next?: VolumePoint) {
    if (!next || this.curveType === VolumeCurveType.Constant)
      return this.volume;

    const t = clamp((time - this.time) / (next.time - this.time), 0, 1);

    const easing = BezierEasing(
      this.p1.x,
      this.p1.y,
      this.p2.x,
      this.p2.y,
    );

    return clamp(
      lerp(this.volume, next.volume, easing(t)),
      0,
      100,
    );
  }

  override copyFrom(other: this) {
    super.copyFrom(other);

    this.volume = other.volume;
    this.curveType = other.curveType;
    this.p1 = other.p1;
    this.p2 = other.p2;
  }

  override isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof VolumePoint))
      return false;

    return this.volume === existing.volume;
  }

  override deepClone(): ControlPoint {
    const clone = new VolumePoint(this.time);

    clone.copyFrom(this);

    return clone;
  }
}
