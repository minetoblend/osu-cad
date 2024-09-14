import { ControlPoint } from './ControlPoint';

export class TimingPoint extends ControlPoint {
  constructor(
    beatLength: number,
    meter: number = 4,
  ) {
    super();

    this.#beatLength = beatLength;
    this.#meter = meter;
  }

  static readonly default = new TimingPoint(60_000 / 120);

  #beatLength;

  get beatLength() {
    return this.#beatLength;
  }

  set beatLength(value: number) {
    if (value === this.#beatLength)
      return;

    this.#beatLength = value;
    this.raiseChanged();
  }

  get bpm() {
    if (this.#beatLength === 0)
      return 0;

    return 60_000 / this.beatLength;
  }

  set bpm(value: number) {
    this.beatLength = 60_000 / value;
  }

  #meter: number = 4;

  get meter() {
    return this.#meter;
  }

  set meter(value: number) {
    if (value === this.#meter)
      return;

    this.#meter = value;
    this.raiseChanged();
  }

  isRedundant(existing?: ControlPoint | undefined): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof TimingPoint))
      return false;

    return this.beatLength === existing.beatLength && this.meter === existing.meter;
  }

  copyFrom(other: typeof this) {
    super.copyFrom(other);

    this.beatLength = other.beatLength;
    this.meter = other.meter;
  }

  deepClone(): ControlPoint {
    const clone = new TimingPoint(this.beatLength, this.meter);
    clone.copyFrom(this);
    return clone;
  }
}
