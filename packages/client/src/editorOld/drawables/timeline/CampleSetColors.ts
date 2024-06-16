import { SampleSet } from '@osucad/common';

export function getSampleSetColor(sampleSet: SampleSet) {
  switch (sampleSet) {
    case SampleSet.Soft:
      return 0x63e2b7;
    case SampleSet.Normal:
      return 0xfe7c9a;
    case SampleSet.Drum:
      return 0xffe660;
    default:
      return 0xaaaaaa;
  }
}
