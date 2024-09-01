import { clamp } from 'osucad-framework';
import { SampleSet } from '../hitSounds/SampleSet';
import { ControlPoint } from './ControlPoint';

export class SamplePoint extends ControlPoint {
  constructor(
    volume: number,
    sampleSet: SampleSet,
    sampleIndex: number = 0,
  ) {
    super();

    this.#volume = volume;
    this.#sampleSet = sampleSet;
    this.#sampleIndex = sampleIndex;
  }

  static readonly default = new SamplePoint(100, SampleSet.Normal, 0);

  #volume: number;
  #sampleSet: SampleSet;
  #sampleIndex;

  get volume() {
    return this.#volume;
  }

  set volume(value: number) {
    value = Math.round(value);
    value = clamp(value, 5, 100);

    if (value === this.#volume)
      return;

    this.#volume = value;
    this.raiseChanged();
  }

  get sampleSet() {
    return this.#sampleSet;
  }

  set sampleSet(value: SampleSet) {
    if (value === this.#sampleSet)
      return;

    this.#sampleSet = value;
    this.raiseChanged();
  }

  get sampleIndex() {
    return this.#sampleIndex;
  }

  set sampleIndex(value: number) {
    if (value === this.#sampleIndex)
      return;

    this.#sampleIndex = value;
    this.raiseChanged();
  }

  isRedundant(existing?: ControlPoint | undefined): boolean {
    if (!existing)
      return false;

    if (!(existing instanceof SamplePoint))
      return false;

    return this.volume === existing.volume;
  }

  deepClone(): ControlPoint {
    const clone = new SamplePoint(this.volume, this.sampleSet, this.sampleIndex);
    clone.copyFrom(this);
    return clone;
  }
}
