import { BindableNumber } from 'osucad-framework';
import { ControlPoint } from './ControlPoint';

export class DifficultyPoint extends ControlPoint {
  constructor(sliderVelocity: number = 1) {
    super();

    this.sliderVelocityBindable.value = sliderVelocity;

    this.sliderVelocityBindable.valueChanged.addListener(this.raiseChanged, this);
  }

  static default = new DifficultyPoint(1);

  sliderVelocityBindable = new BindableNumber(1).withRange(0.1, 10).withPrecision(0.1);

  get sliderVelocity() {
    return this.sliderVelocityBindable.value;
  }

  set sliderVelocity(value: number) {
    this.sliderVelocityBindable.value = value;
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof DifficultyPoint))
      return false;

    return this.sliderVelocity === existing.sliderVelocity;
  }

  deepClone(): DifficultyPoint {
    const clone = new DifficultyPoint();
    clone.copyFrom(this);
    return clone;
  }

  copyFrom(other: this) {
    super.copyFrom(other);

    this.sliderVelocity = other.sliderVelocity;
  }
}
