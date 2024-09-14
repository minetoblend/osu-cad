import { Additions } from './Additions.ts';
import { SampleSet } from './SampleSet.ts';
import { Action, Bindable } from 'osucad-framework';
import { HitSound } from './HitSound.ts';

export type HitSoundStateChangeEvent = ['additions', Additions] | ['sampleSet'] | ['additionSampleSet'];

export class HitSoundState {
  sampleSetBindable = new Bindable(SampleSet.Auto);

  additionsSampleSetBindable = new Bindable(SampleSet.Auto);

  additionsBindable = new Bindable(Additions.None);

  readonly changed = new Action<HitSoundStateChangeEvent>();

  hasAdditions(additions: Additions) {
    return !!(this.additions & additions);
  }

  get additions() {
    return this.additionsBindable.value;
  }

  setAdditions(value: Additions, emitChange = true) {
    if (this.additions === value)
      return;

    const difference = this.additions ^ value;

    this.additionsBindable.value = value;

    if (emitChange)
      this.changed.emit(['additions', difference]);
  }


  get sampleSet() {
    return this.sampleSetBindable.value;
  }

  setSampleSet(value: SampleSet, emitChange = true) {
    if (this.sampleSet === value)
      return;

    this.sampleSetBindable.value = value;

    if (emitChange)
      this.changed.emit(['sampleSet']);
  }

  get additionsSampleSet() {
    return this.additionsSampleSetBindable.value;
  }

  setAdditionSampleSet(value: SampleSet, emitChange = true) {
    if (this.additionsSampleSet === value)
      return;

    this.additionsSampleSetBindable.value = value;

    if (emitChange)
      this.changed.emit(['additionSampleSet']);
  }

  asHitSound() {
    return new HitSound(
      this.sampleSet,
      this.additionsSampleSet,
      this.additions,
    );
  }
}
