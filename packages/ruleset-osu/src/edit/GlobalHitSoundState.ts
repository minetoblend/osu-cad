import type { SampleSet } from '@osucad/common';
import { Additions, TernaryState } from '@osucad/common';
import { Bindable } from 'osucad-framework';

export class GlobalHitSoundState {
  readonly whistle = new Bindable(TernaryState.Inactive);
  readonly finish = new Bindable(TernaryState.Inactive);
  readonly clap = new Bindable(TernaryState.Inactive);

  readonly sampleSet = new Bindable<SampleSet | null>(null);
  readonly additionsSampleSet = new Bindable<SampleSet | null>(null);

  getBindableForAddition(addition: Additions) {
    switch (addition) {
      case Additions.Whistle:
        return this.whistle;
      case Additions.Finish:
        return this.finish;
      case Additions.Clap:
        return this.clap;
      default:
        throw new Error('Invalid addition');
    }
  }

  get additions() {
    let additions = Additions.None;

    if (this.whistle.value === TernaryState.Active)
      additions |= Additions.Whistle;
    if (this.finish.value === TernaryState.Active)
      additions |= Additions.Finish;
    if (this.clap.value === TernaryState.Active)
      additions |= Additions.Clap;

    return additions;
  }
}
