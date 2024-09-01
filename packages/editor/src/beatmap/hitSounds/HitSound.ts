import { Additions } from './Additions';
import { SampleSet } from './SampleSet';
import { SampleType } from './SampleType';

export class HitSound {
  constructor(
    readonly sampleSet = SampleSet.Auto,
    readonly additionSampleSet = SampleSet.Auto,
    readonly additions = Additions.None,
  ) {
  }

  static readonly Default = new HitSound();

  * getSampleTypes() {
    if (this.additions & Additions.Whistle)
      yield SampleType.Whistle;
    if (this.additions & Additions.Finish)
      yield SampleType.Whistle;
    if (this.additions & Additions.Clap)
      yield SampleType.Clap;
  }

  equals(other: HitSound) {
    return this.sampleSet === other.sampleSet
      && this.additionSampleSet === other.additionSampleSet
      && this.additions === other.additions;
  }

  withSampleSet(sampleSet: SampleSet) {
    return new HitSound(sampleSet, this.additionSampleSet, this.additions);
  }

  withAdditionSampleSet(additionSampleSet: SampleSet) {
    return new HitSound(this.sampleSet, additionSampleSet, this.additions);
  }

  withAdditions(additions: Additions) {
    return new HitSound(this.sampleSet, this.additionSampleSet, additions);
  }
}
