import { ControlPoint } from './ControlPoint';

export class DifficultyPoint extends ControlPoint {
  constructor(time: number = 0, sliderVelocity: number = 1) {
    super(time);

    this.sliderVelocity = sliderVelocity;
  }

  static default = new DifficultyPoint(1);

  override get controlPointName(): string {
    return 'Difficulty Point';
  }

  readonly #sliderVelocity = this.property('sliderVelocity', 1);

  get sliderVelocityBindable() {
    return this.#sliderVelocity.bindable;
  }

  get sliderVelocity() {
    return this.#sliderVelocity.value;
  }

  set sliderVelocity(value: number) {
    this.#sliderVelocity.value = value;
  }

  isRedundant(existing?: ControlPoint): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof DifficultyPoint))
      return false;

    return this.sliderVelocity === existing.sliderVelocity;
  }

  deepClone(): DifficultyPoint {
    const clone = new DifficultyPoint(this.time);
    clone.copyFrom(this);
    return clone;
  }

  override copyFrom(other: this) {
    super.copyFrom(other);

    this.sliderVelocity = other.sliderVelocity;
  }
}
