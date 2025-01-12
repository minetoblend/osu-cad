import type { HitSound } from '../../../hitsounds/HitSound';
import type { SampleSet } from '../../../hitsounds/SampleSet';
import { Additions } from '../../../hitsounds/Additions';
import { TernaryState } from '../../../utils/TernaryState';

export class HitSoundStateBuilder {
  #count = 0;

  additions = Additions.None;

  mixedAdditions = Additions.None;

  sampleSet: SampleSet | null = null;

  additionSampleSet: SampleSet | null = null;

  add(hitSound: HitSound) {
    if (this.#count === 0) {
      this.additions = hitSound.additions;
      this.sampleSet = hitSound.sampleSet;
      this.additionSampleSet = hitSound.additionSampleSet;
      return;
    }

    this.mixedAdditions |= (this.additions ^ hitSound.additions);
    this.additions &= hitSound.additions;

    if (hitSound.sampleSet !== this.sampleSet)
      this.sampleSet = null;

    if (hitSound.additionSampleSet !== this.additionSampleSet)
      this.additionSampleSet = null;
  }

  getAdditionTernary(addition: Additions): TernaryState {
    if (this.mixedAdditions & addition)
      return TernaryState.Indeterminate;
    return (addition & this.additions) ? TernaryState.Active : TernaryState.Inactive;
  }
}
