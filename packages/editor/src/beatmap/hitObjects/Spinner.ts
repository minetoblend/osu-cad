import { Vec2 } from 'osucad-framework';
import type { IPatchable } from '../../editor/commands/IPatchable';
import type { SerializedSpinner } from '../serialization/HitObjects';
import { SpinnerPatchEncoder } from '../../editor/commands/patchEncoder/SpinnerPatchEncoder';
import { OsuHitObject } from './OsuHitObject';
import { SampleSet } from '../hitSounds/SampleSet.ts';
import { HitSample } from '../hitSounds/HitSample.ts';
import { SampleType } from '../hitSounds/SampleType.ts';
import { ControlPointInfo } from '../timing/ControlPointInfo.ts';

export class Spinner extends OsuHitObject implements IPatchable<SerializedSpinner> {
  #duration = 0;

  override get duration() {
    return this.#duration;
  }

  override set duration(value: number) {
    this.#duration = value;
  }

  get endTime() {
    return this.startTime + this.duration;
  }

  set endTime(value: number) {
    this.duration = value - this.startTime;
  }

  get stackOffset() {
    return Vec2.zero();
  }

  applyPatch(patch: Partial<SerializedSpinner>) {
    super.applyPatch(patch);

    if (patch.duration !== undefined)
      this.duration = patch.duration;
  }

  createPatchEncoder() {
    return new SpinnerPatchEncoder(this);
  }

  isSpinner(): this is Spinner {
    return true;
  }

  protected createHitSamples(controlPointInfo: ControlPointInfo) {
    const samplePoint = controlPointInfo.samplePointAt(this.startTime);

    let sampleSet = this.hitSound.sampleSet;
    if (sampleSet === SampleSet.Auto)
      sampleSet = samplePoint.sampleSet;

    this.addHitSample(
      new HitSample(
        this.endTime,
        sampleSet,
        SampleType.Normal,
        samplePoint.volume,
        samplePoint.sampleIndex,
      ),
    );

    let additionSampleSet = this.hitSound.additionSampleSet;
    if (additionSampleSet === SampleSet.Auto)
      additionSampleSet = sampleSet;

    for (const sampleType of this.hitSound.getSampleTypes()) {
      this.addHitSample(
        new HitSample(
          this.endTime,
          additionSampleSet,
          sampleType,
          samplePoint.volume,
          samplePoint.sampleIndex,
        ),
      );
    }
  }
}
