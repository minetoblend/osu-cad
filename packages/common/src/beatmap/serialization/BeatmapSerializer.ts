import { buildClassSerialDescriptor, Decoder, Encoder, Serializer } from "@osucad/serialization";
import { Beatmap } from "@osucad/common";
import { BeatmapDifficultyInfoSerializer } from "./BeatmapDifficultySerializer";
import { BeatmapMetadataSerializer } from "./BeatmapMetadataSerializer";
import { BeatmapSettingsSerializer } from "./BeatmapSettingsSerializer";

export const BeatmapSerializer: Serializer<Beatmap> = {
  descriptor: buildClassSerialDescriptor('Beatmap', ({element}) => {
    element('metadata', BeatmapMetadataSerializer.descriptor);
    element('difficulty', BeatmapDifficultyInfoSerializer.descriptor);
    element('settings', BeatmapSettingsSerializer.descriptor);
  }),
  serialize(encoder: Encoder, value: Beatmap) {
    const descriptor = this.descriptor
    encoder.encodeStructure(descriptor, encoder => {
      encoder.encodeSerializableElement(descriptor, 0, BeatmapMetadataSerializer, value.metadata);
      encoder.encodeSerializableElement(descriptor, 1, BeatmapDifficultyInfoSerializer, value.difficulty);
      encoder.encodeSerializableElement(descriptor, 2, BeatmapSettingsSerializer, value.settings);

    })
  },
  deserialize(decoder: Decoder): Beatmap {
    const descriptor = this.descriptor;

    const nested = decoder.beginStructure(descriptor);

    const beatmap = new Beatmap(
      nested.decodeSerializableElement(descriptor, 1, BeatmapDifficultyInfoSerializer),
      nested.decodeSerializableElement(descriptor, 2, BeatmapSettingsSerializer),
      nested.decodeSerializableElement(descriptor, 0, BeatmapMetadataSerializer)
    );

    nested.endStructure(descriptor);

    return beatmap;
  }
}
