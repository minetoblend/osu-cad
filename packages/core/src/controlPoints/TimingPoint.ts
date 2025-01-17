import { ControlPoint } from './ControlPoint';

export class TimingPoint extends ControlPoint {
  constructor(
    time: number = 0,
    beatLength: number = TimingPoint.DEFAULT_BEAT_LENGTH,
    meter: number = 4,
  ) {
    super(time);

    this.beatLength = beatLength;
    this.meter = meter;
  }

  static readonly DEFAULT_BEAT_LENGTH = 60_000 / 120;

  static readonly default = new TimingPoint(0, TimingPoint.DEFAULT_BEAT_LENGTH);

  override get controlPointName(): string {
    return 'Timing Point';
  }

  readonly #beatLength = this.property('beatLength', TimingPoint.DEFAULT_BEAT_LENGTH);

  get beatLengthBindable() {
    return this.#beatLength.bindable;
  }

  get beatLength() {
    return this.#beatLength.value;
  }

  set beatLength(value: number) {
    this.#beatLength.value = value;
    this.raiseChanged();
  }

  get bpm() {
    if (this.beatLength === 0)
      return 0;

    return 60_000 / this.beatLength;
  }

  set bpm(value: number) {
    this.beatLength = 60_000 / value;
  }

  readonly #meter = this.property('meter', 4);

  get meterBindable() {
    return this.#meter.bindable;
  }

  get meter() {
    return this.#meter.value;
  }

  set meter(value: number) {
    this.#meter.value = value;
    this.raiseChanged();
  }

  readonly #omitFirstBarLine = this.property('omitFirstBarLine', false);

  get#omitFirstBarLineBindable() {
    return this.#omitFirstBarLine.bindable;
  }

  get omitFirstBarLine() {
    return this.#omitFirstBarLine.value;
  }

  set omitFirstBarLine(value: boolean) {
    this.#omitFirstBarLine.value = value;
    this.raiseChanged();
  }

  isRedundant(existing?: ControlPoint | undefined): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof TimingPoint))
      return false;

    return this.beatLength === existing.beatLength && this.meter === existing.meter;
  }

  override copyFrom(other: typeof this) {
    super.copyFrom(other);

    this.beatLength = other.beatLength;
    this.meter = other.meter;
  }

  deepClone(): TimingPoint {
    const clone = new TimingPoint(this.time, this.beatLength, this.meter);
    clone.copyFrom(this);
    return clone;
  }
}
