import type { Patchable } from '../commands/Patchable';
import { Bindable, BindableNumber } from 'osucad-framework';
import { PatchUtils } from '../commands/PatchUtils';
import { SampleSet } from '../hitsounds/SampleSet';
import { ControlPoint } from './ControlPoint';

export interface SamplePointPatch {
  volume: number;
  sampleSet: SampleSet;
  sampleIndex: number;
}

export class SamplePoint extends ControlPoint implements Patchable<SamplePointPatch> {
  constructor(
    time: number,
    volume: number,
    sampleSet: SampleSet,
    sampleIndex: number = 0,
  ) {
    super(time);

    this.volumeBindable.value = volume;
    this.sampleSetBindable.value = sampleSet;
    this.sampleIndexBindable.value = sampleIndex;

    this.volumeBindable.valueChanged.addListener(this.raiseChanged, this);
    this.sampleSetBindable.valueChanged.addListener(this.raiseChanged, this);
    this.sampleIndexBindable.valueChanged.addListener(this.raiseChanged, this);
  }

  static readonly default = new SamplePoint(0, 100, SampleSet.Normal, 0);

  volumeBindable = new BindableNumber(100).withRange(5, 100).withPrecision(1);
  sampleSetBindable = new Bindable<SampleSet>(SampleSet.Normal);
  sampleIndexBindable = new BindableNumber(0).withMinValue(0).withPrecision(1);

  get volume() {
    return this.volumeBindable.value;
  }

  set volume(value: number) {
    this.volumeBindable.value = value;
  }

  get sampleSet() {
    return this.sampleSetBindable.value;
  }

  set sampleSet(value: SampleSet) {
    this.sampleSetBindable.value = value;
  }

  get sampleIndex() {
    return this.sampleIndexBindable.value;
  }

  set sampleIndex(value: number) {
    this.sampleIndexBindable.value = value;
  }

  isRedundant(existing?: ControlPoint | undefined): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof SamplePoint))
      return false;

    return this.volume === existing.volume && this.sampleSet === existing.sampleSet && this.sampleIndex === existing.sampleIndex;
  }

  deepClone(): SamplePoint {
    const clone = new SamplePoint(this.time, this.volume, this.sampleSet, this.sampleIndex);
    clone.copyFrom(this);
    return clone;
  }

  applyPatch(patch: Partial<SamplePointPatch>) {
    PatchUtils.applyPatch(patch, this);
  }

  asPatch(): SamplePointPatch {
    return {
      volume: this.volume,
      sampleIndex: this.sampleIndex,
      sampleSet: this.sampleIndex,
    };
  }
}
