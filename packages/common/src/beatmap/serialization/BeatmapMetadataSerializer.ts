import {
  buildClassSerialDescriptor,
  Decoder,
  Encoder,
  Float64Serializer,
  Serializer,
  StringSerializer
} from "@osucad/serialization";
import { BeatmapDifficultyInfo, BeatmapMetadata } from "@osucad/common";

export const BeatmapMetadataSerializer: Serializer<BeatmapMetadata> = {
  descriptor: buildClassSerialDescriptor('BeatmapDifficultyInfo', ({element}) => {
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
    const descriptor = this.descriptor
    encoder.encodeStructure(descriptor, (encoder) => {
      encoder.encodeStringElement(descriptor, 0, value.artist)
      encoder.encodeStringElement(descriptor, 1, value.artistUnicode)
      encoder.encodeStringElement(descriptor, 2, value.title)
      encoder.encodeStringElement(descriptor, 3, value.titleUnicode)
      encoder.encodeStringElement(descriptor, 4, value.source)
      encoder.encodeStringElement(descriptor, 5, value.tags)
      encoder.encodeStringElement(descriptor, 6, value.creator)
      encoder.encodeStringElement(descriptor, 7, value.difficultyName)
      encoder.encodeFloat64Element(descriptor, 8, value.previewTime)
    })
  },
  deserialize(decoder: Decoder): BeatmapMetadata {
    const descriptor = this.descriptor
    const difficulty = new BeatmapMetadata()
    const nested = decoder.beginStructure(descriptor)

    difficulty.artist = nested.decodeStringElement(descriptor, 0)
    difficulty.artistUnicode = nested.decodeStringElement(descriptor, 1)
    difficulty.title = nested.decodeStringElement(descriptor, 2)
    difficulty.titleUnicode = nested.decodeStringElement(descriptor, 3)
    difficulty.source = nested.decodeStringElement(descriptor, 4)
    difficulty.tags = nested.decodeStringElement(descriptor, 5)
    difficulty.creator = nested.decodeStringElement(descriptor, 6)
    difficulty.difficultyName = nested.decodeStringElement(descriptor, 7)
    difficulty.previewTime = nested.decodeFloat64Element(descriptor, 8)

    nested.endStructure(descriptor)
  }
}
