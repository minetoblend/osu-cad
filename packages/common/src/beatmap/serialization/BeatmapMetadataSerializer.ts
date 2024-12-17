import type {
  Decoder,
  Encoder,
  Serializer,
} from '@osucad/serialization';
import {
  buildClassSerialDescriptor,
  Float64Serializer,
  StringSerializer,
} from '@osucad/serialization';
import { BeatmapMetadata } from '../BeatmapMetadata';

export const BeatmapMetadataSerializer: Serializer<BeatmapMetadata> = {
  descriptor: buildClassSerialDescriptor('BeatmapDifficultyInfo', ({ element }) => {
    element('artist', StringSerializer.descriptor);
    element('artistUnicode', StringSerializer.descriptor);
    element('title', StringSerializer.descriptor);
    element('titleUnicode', StringSerializer.descriptor);
    element('source', StringSerializer.descriptor);
    element('tags', StringSerializer.descriptor);
    element('creator', StringSerializer.descriptor);
    element('difficultyName', StringSerializer.descriptor);
    element('previewTime', Float64Serializer.descriptor);
  }),
  serialize(encoder: Encoder, value: BeatmapMetadata) {
    const descriptor = this.descriptor;
    encoder.encodeStructure(descriptor, (encoder) => {
      encoder.encodeStringElement(descriptor, 0, value.artist);
      encoder.encodeStringElement(descriptor, 1, value.artistUnicode);
      encoder.encodeStringElement(descriptor, 2, value.title);
      encoder.encodeStringElement(descriptor, 3, value.titleUnicode);
      encoder.encodeStringElement(descriptor, 4, value.source);
      encoder.encodeStringElement(descriptor, 5, value.tags);
      encoder.encodeStringElement(descriptor, 6, value.creator);
      encoder.encodeStringElement(descriptor, 7, value.difficultyName);
      encoder.encodeFloat64Element(descriptor, 8, value.previewTime);
    });
  },
  deserialize(decoder: Decoder): BeatmapMetadata {
    const descriptor = this.descriptor;

    return decoder.decodeStructure(descriptor, (decoder) => {
      const metadata = new BeatmapMetadata();

      metadata.artist = decoder.decodeStringElement(descriptor, 0);
      metadata.artistUnicode = decoder.decodeStringElement(descriptor, 1);
      metadata.title = decoder.decodeStringElement(descriptor, 2);
      metadata.titleUnicode = decoder.decodeStringElement(descriptor, 3);
      metadata.source = decoder.decodeStringElement(descriptor, 4);
      metadata.tags = decoder.decodeStringElement(descriptor, 5);
      metadata.creator = decoder.decodeStringElement(descriptor, 6);
      metadata.difficultyName = decoder.decodeStringElement(descriptor, 7);
      metadata.previewTime = decoder.decodeFloat64Element(descriptor, 8);

      return metadata;
    });
  },
};
