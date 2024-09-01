import { clamp } from 'osucad-framework';
import { ControlPoint } from './ControlPoint';

export class DifficultyPoint extends ControlPoint {
  constructor(sliderVelocity: number = 1) {
    super();

    this.#sliderVelocity = sliderVelocity;
  }

  static default = new DifficultyPoint(1);

  #sliderVelocity: number;

  get sliderVelocity() {
    return this.#sliderVelocity;
  }

  set sliderVelocity(value: number) {
    if (value === this.#sliderVelocity)
      return;

    value = Math.round(value * 100) / 100;
    value = clamp(value, 0.1, 10);

    this.#sliderVelocity = value;
    this.raiseChanged();
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof DifficultyPoint))
      return false;

    return this.sliderVelocity === existing.sliderVelocity;
  }

  deepClone(): ControlPoint {
    const clone = new DifficultyPoint();
    clone.copyFrom(this);
    return clone;
  }

  copyFrom(other: this) {
    super.copyFrom(other);

    this.sliderVelocity = other.sliderVelocity;
  }
}
