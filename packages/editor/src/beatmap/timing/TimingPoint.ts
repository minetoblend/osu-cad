import type { Patchable } from '../../editor/commands/Patchable';
import { BindableNumber } from 'osucad-framework';
import { PatchUtils } from '../../editor/commands/PatchUtils';
import { ControlPoint } from './ControlPoint';

export interface TimingPointPatch {
  beatLength: number;
  meter: number;
}

export class TimingPoint extends ControlPoint implements Patchable<TimingPointPatch> {
  constructor(
    beatLength: number,
    meter: number = 4,
  ) {
    super();

    this.beatLengthBindable.value = beatLength;
    this.meterBindable.value = meter;
  }

  static readonly default = new TimingPoint(60_000 / 120);

  readonly beatLengthBindable = new BindableNumber(60_000 / 120);

  get beatLength() {
    return this.beatLengthBindable.value;
  }

  set beatLength(value: number) {
    this.beatLengthBindable.value = value;
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

  meterBindable = new BindableNumber(4);

  get meter() {
    return this.meterBindable.value;
  }

  set meter(value: number) {
    this.meterBindable.value = value;
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

  deepClone(): TimingPoint {
    const clone = new TimingPoint(this.beatLength, this.meter);
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
