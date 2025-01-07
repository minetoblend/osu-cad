import type { Decoder, Encoder, Serializer } from '@osucad/serialization';
import { buildClassSerialDescriptor, Uint8Serializer } from '@osucad/serialization';
import { Additions } from './Additions';
import { SampleSet } from './SampleSet';
import { SampleType } from './SampleType';

export class HitSound {
  constructor(
    readonly sampleSet = SampleSet.Auto,
    readonly additionSampleSet = SampleSet.Auto,
    readonly additions = Additions.None,
  ) {
  }

  static readonly Default = new HitSound();

  * getSampleTypes() {
    if (this.additions & Additions.Whistle)
      yield SampleType.Whistle;
    if (this.additions & Additions.Finish)
      yield SampleType.Finish;
    if (this.additions & Additions.Clap)
      yield SampleType.Clap;
  }

  equals(other: HitSound) {
    return this.sampleSet === other.sampleSet
      && this.additionSampleSet === other.additionSampleSet
      && this.additions === other.additions;
  }

  withSampleSet(sampleSet: SampleSet) {
    return new HitSound(sampleSet, this.additionSampleSet, this.additions);
  }

  withAdditionSampleSet(additionSampleSet: SampleSet) {
    return new HitSound(this.sampleSet, additionSampleSet, this.additions);
  }

  withAdditions(additions: Additions) {
    return new HitSound(this.sampleSet, this.additionSampleSet, additions);
  }
}

export class HitSoundSerializer implements Serializer<HitSound> {
  readonly descriptor = buildClassSerialDescriptor('HitSound', ({ element }) => {
    element('sampleSet', Uint8Serializer.descriptor);
    element('additionSampleSet', Uint8Serializer.descriptor);
    element('additions', Uint8Serializer.descriptor);
  });

  static readonly instance = new HitSoundSerializer();

  serialize(encoder: Encoder, value: HitSound) {
    encoder.encodeStructure(this.descriptor, (encoder) => {
      encoder.encodeUint8Element(this.descriptor, 0, value.sampleSet);
      encoder.encodeUint8Element(this.descriptor, 1, value.additionSampleSet);
      encoder.encodeUint8Element(this.descriptor, 2, value.additions);
    });
  }

  deserialize(decoder: Decoder): HitSound {
    return decoder.decodeStructure(this.descriptor, decoder =>
      new HitSound(
        decoder.decodeUint8Element(this.descriptor, 0),
        decoder.decodeUint8Element(this.descriptor, 1),
        decoder.decodeUint8Element(this.descriptor, 2),
      ));
  }
}
