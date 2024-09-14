import { Additions } from './Additions';

export enum SampleType {
  Normal = 0,
  Whistle = 1,
  Finish = 2,
  Clap = 3,
  SliderSlide = 4,
  SliderWhistle = 5,
}

export function additionToSampleType(additions: Additions) {
  switch (additions) {
    case Additions.None:
      return SampleType.Normal;
    case Additions.Whistle:
      return SampleType.Whistle;
    case Additions.Finish:
      return SampleType.Finish;
    case Additions.Clap:
      return SampleType.Clap;
    default:
      throw new Error('Can only convert one addition at a time');
  }
}
