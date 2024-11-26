import { buildClassSerialDescriptor, Decoder, Encoder, Float32Serializer, Serializer } from "@osucad/serialization";
import { Beatmap, BeatmapDifficultyInfo } from "@osucad/common";

export const BeatmapDifficultyInfoSerializer: Serializer<BeatmapDifficultyInfo> = {
  descriptor: buildClassSerialDescriptor('BeatmapDifficultyInfo', ({element}) => {
    element('hpDrainRate', Float32Serializer.descriptor);
    element('circleSize', Float32Serializer.descriptor);
    element('approachRate', Float32Serializer.descriptor);
    element('overallDifficulty', Float32Serializer.descriptor);
    element('sliderMultiplier', Float32Serializer.descriptor);
    element('sliderTickRate', Float32Serializer.descriptor);
  }),
  serialize(encoder: Encoder, value: BeatmapDifficultyInfo) {
    const descriptor = this.descriptor
    encoder.encodeStructure(descriptor, (encoder) => {
      encoder.encodeFloat32Element(descriptor, 0, value.hpDrainRate)
      encoder.encodeFloat32Element(descriptor, 1, value.circleSize)
      encoder.encodeFloat32Element(descriptor, 2, value.approachRate)
      encoder.encodeFloat32Element(descriptor, 3, value.overallDifficulty)
      encoder.encodeFloat32Element(descriptor, 4, value.sliderMultiplier)
      encoder.encodeFloat32Element(descriptor, 5, value.sliderTickRate)
    })
  },
  deserialize(decoder: Decoder): BeatmapDifficultyInfo {
    const descriptor = this.descriptor
    const difficulty = new BeatmapDifficultyInfo()
    const nested = decoder.beginStructure(descriptor)

    difficulty.hpDrainRate = nested.decodeFloat32Element(descriptor, 0)
    difficulty.circleSize = nested.decodeFloat32Element(descriptor, 1)
    difficulty.approachRate = nested.decodeFloat32Element(descriptor, 2)
    difficulty.overallDifficulty = nested.decodeFloat32Element(descriptor, 3)
    difficulty.sliderMultiplier = nested.decodeFloat32Element(descriptor, 4)
    difficulty.sliderTickRate = nested.decodeFloat32Element(descriptor, 5)

    nested.endStructure(descriptor)
  }
}
