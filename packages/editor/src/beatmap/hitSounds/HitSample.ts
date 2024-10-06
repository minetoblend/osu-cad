import { Additions } from './Additions';
import { SampleSet } from './SampleSet';
import { SampleType } from './SampleType';

export class HitSample {
  constructor(
    readonly time: number,
    readonly sampleSet: SampleSet,
    readonly sampleType: SampleType,
    readonly volume: number,
    readonly index = 0,
    readonly duration?: number,
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

  get sampleName(): string | null {
    let key = '';
    switch (this.sampleSet) {
      case SampleSet.Soft:
        key = 'soft';
        break;
      case SampleSet.Normal:
        key = 'normal';
        break;
      case SampleSet.Drum:
        key = 'drum';
        break;
      default:
        return null;
    }

    switch (this.sampleType) {
      case SampleType.Normal:
        key += '-hitnormal';
        break;
      case SampleType.Whistle:
        key += '-hitwhistle';
        break;
      case SampleType.Finish:
        key += '-hitfinish';
        break;
      case SampleType.Clap:
        key += '-hitclap';
        break;
      case SampleType.SliderSlide:
        key += '-sliderslide';
        break;
      case SampleType.SliderWhistle:
        key += '-sliderwhistle';
        break;
    }

    return key;
  }
}
