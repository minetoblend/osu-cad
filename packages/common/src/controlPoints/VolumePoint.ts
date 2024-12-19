// @ts-expect-error looks like someone fucked up the types
import BezierEasing from 'bezier-easing';
import { clamp, lerp } from 'osucad-framework';
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

  #curvature = this.property('curvature', 0);

  get curvatureBindable() {
    return this.#curvature.bindable;
  }

  get curvature() {
    return this.#curvature.value;
  }

  set curvature(value: number) {
    this.#curvature.value = value;
  }

  volumeAtTime(time: number, next?: VolumePoint) {
    if (!next || this.curveType === VolumeCurveType.Constant)
      return this.volume;

    const t = clamp((time - this.time) / (next.time - this.time), 0, 1);

    const easing = this.curvature > 0
      ? BezierEasing(
        0.25 - this.curvature * 0.25,
        0.25 + this.curvature * 0.75,
        0.75 - this.curvature * 0.75,
        0.75 + this.curvature * 0.25,
      )
      : BezierEasing(
        0.25 - this.curvature * 0.75,
        0.25 + this.curvature * 0.25,
        0.75 - this.curvature * 0.25,
        0.75 + this.curvature * 0.75,
      );

    return lerp(this.volume, next.volume, easing(t));
  }

  override copyFrom(other: this) {
    super.copyFrom(other);

    this.volume = other.volume;
    this.curveType = other.curveType;
    this.curvature = other.curvature;
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
