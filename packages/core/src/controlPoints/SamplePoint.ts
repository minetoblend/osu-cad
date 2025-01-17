import { BindableNumber } from '@osucad/framework';
import { SampleSet } from '../hitsounds/SampleSet';
import { ControlPoint } from './ControlPoint';

export class SamplePoint extends ControlPoint {
  constructor(
    time: number = 0,
    volume: number = 100,
    sampleSet: SampleSet = SampleSet.Auto,
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

  override get controlPointName(): string {
    return 'Sample Point';
  }

  static readonly default = new SamplePoint(0, 100, SampleSet.Normal, 0);

  #volume = this.property('volume', new BindableNumber(100).withRange(5, 100).withPrecision(1));

  #sampleSet = this.property('sampleSet', SampleSet.Normal);

  #sampleIndex = this.property('sampleSet', new BindableNumber(0).withMinValue(0).withPrecision(1));

  get volumeBindable() {
    return this.#volume.bindable;
  }

  get sampleSetBindable() {
    return this.#sampleSet.bindable;
  }

  get sampleIndexBindable() {
    return this.#sampleIndex.bindable;
  }

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
}
