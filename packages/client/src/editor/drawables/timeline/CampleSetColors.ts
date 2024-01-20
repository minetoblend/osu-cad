import {SampleSet} from "@osucad/common";

export function getSampleSetColor(sampleSet: SampleSet) {
  switch (sampleSet) {
    case SampleSet.Soft:
      return 0x63E2B7;
    case SampleSet.Normal:
      return 0xFE7C9A;
    case SampleSet.Drum:
      return 0xFFE660;
    default:
      return 0xAAAAAA;
  }
}