import type { ControlPointInfo, IHasDuration } from '@osucad/core';
import type { ClassSerialDescriptorBuilder, CompositeDecoder, CompositeEncoder } from '@osucad/serialization';
import { HitSample, polymorphicHitObjectSerializers, SampleSet, SampleType } from '@osucad/core';
import { Vec2 } from '@osucad/framework';
import { Float64Serializer } from '@osucad/serialization';
import { OsuHitObject, OsuHitObjectSerializer } from './OsuHitObject';

export class Spinner extends OsuHitObject implements IHasDuration {
  readonly hasDuration = true;

  #duration = this.property('duration', 0);

  get durationBindable() {
    return this.#duration.bindable;
  }

  override get duration() {
    return this.#duration.value;
  }

  override set duration(value: number) {
    this.#duration.value = value;
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

export class SpinnerSerializer extends OsuHitObjectSerializer<Spinner> {
  constructor() {
    super('Spinner');
  }

  protected override buildDescriptor(builder: ClassSerialDescriptorBuilder) {
    super.buildDescriptor(builder);
    builder.element('duration', Float64Serializer.descriptor, true);
  }

  protected override createInstance(): Spinner {
    return new Spinner();
  }

  protected override serializeProperties(encoder: CompositeEncoder, object: Spinner) {
    super.serializeProperties(encoder, object);

    encoder.encodeFloat64Element(this.descriptor, 5, object.duration);
  }

  protected override deserializeProperties(decoder: CompositeDecoder, object: Spinner) {
    super.deserializeProperties(decoder, object);

    object.duration = decoder.decodeFloat64Element(this.descriptor, 5);
  }
}

polymorphicHitObjectSerializers.set(Spinner, new SpinnerSerializer());
