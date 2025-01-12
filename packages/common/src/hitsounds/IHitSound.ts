import type { Additions } from './Additions';
import type { SampleSet } from './SampleSet';

export interface IHitSound {
  sampleSet: SampleSet;
  additionSampleSet: SampleSet;
  additions: Additions;
}
