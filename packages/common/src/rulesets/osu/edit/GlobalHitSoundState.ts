import { Bindable } from 'osucad-framework';
import { SampleSet } from '../../../hitsounds/SampleSet';
import { TernaryState } from '../../../utils/TernaryState';

export class GlobalHitSoundState {
  readonly whistle = new Bindable(TernaryState.Inactive);
  readonly finish = new Bindable(TernaryState.Inactive);
  readonly clap = new Bindable(TernaryState.Inactive);

  readonly sampleSet = new Bindable(SampleSet.Auto);
}
