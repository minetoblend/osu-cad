import type { SampleSet } from './SampleSet';
import { SampleType } from './SampleType';
import { Additions } from './Additions';

export class HitSample {
  constructor(
    readonly time: number,
    readonly sampleSet: SampleSet,
    readonly sampleType: SampleType,
    readonly volume: number,
    readonly duration?: number,
    readonly index = 0,
  ) {
  }

  get addition() {
    switch (this.sampleType) {
      case SampleType.Normal:
        return Additions.None;
      case SampleType.Whistle:
        return Additions.Whistle;
      case SampleType.Finish:
        return Additions.Finish;
      case SampleType.Clap:
        return Additions.Clap;
    }
  }
}
