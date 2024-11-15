import type { IPatchable } from '../../../commands/IPatchable';
import type { ControlPointInfo } from '../../../controlPoints/ControlPointInfo';
import type { SerializedSpinner } from '../../../serialization/HitObjects';
import { Vec2 } from 'osucad-framework';
import { HitSample } from '../../../hitsounds/HitSample';
import { SampleSet } from '../../../hitsounds/SampleSet';
import { SampleType } from '../../../hitsounds/SampleType';
import { OsuHitObject } from './OsuHitObject';

export class Spinner extends OsuHitObject implements IPatchable<SerializedSpinner> {
  #duration = 0;

  override get duration() {
    return this.#duration;
  }

  override set duration(value: number) {
    this.#duration = value;
  }

  override get endTime() {
    return this.startTime + this.duration;
  }

  override set endTime(value: number) {
    this.duration = value - this.startTime;
  }

  override get stackOffset() {
    return Vec2.zero();
  }

  override applyPatch(patch: Partial<SerializedSpinner>) {
    super.applyPatch(patch);

    if (patch.duration !== undefined)
      this.duration = patch.duration;
  }

  override isSpinner(): this is Spinner {
    return true;
  }

  protected override createHitSamples(controlPointInfo: ControlPointInfo) {
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
