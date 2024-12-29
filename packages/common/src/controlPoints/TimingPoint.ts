import type { Patchable } from '../commands/Patchable';
import type { Property } from '../crdt/Property';
import { PatchUtils } from '../commands/PatchUtils';
import { ControlPoint } from './ControlPoint';

export interface TimingPointPatch {
  beatLength: number;
  meter: number;
}

export class TimingPoint extends ControlPoint implements Patchable<TimingPointPatch> {
  constructor(
    time: number,
    beatLength: number,
    meter: number = 4,
  ) {
    super(time);

    this.#beatLength = this.property('beatLength', beatLength);
    this.#meter = this.property('meter', meter);
  }

  static readonly default = new TimingPoint(0, 60_000 / 120);

  readonly #beatLength: Property<number>;

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

  readonly #meter: Property<number>;

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

  applyPatch(patch: Partial<TimingPointPatch>) {
    PatchUtils.applyPatch(patch, this);
  }

  asPatch(): TimingPointPatch {
    return {
      beatLength: this.beatLength,
      meter: this.meter,
    };
  }
}
