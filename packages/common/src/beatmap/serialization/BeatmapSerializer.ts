import { buildClassSerialDescriptor, Decoder, Encoder, Serializer } from "@osucad/serialization";
import { Beatmap } from "@osucad/common";
import { BeatmapDifficultyInfoSerializer } from "./BeatmapDifficultySerializer";
import { BeatmapMetadataSerializer } from "./BeatmapMetadataSerializer";
import { BeatmapSettingsSerializer } from "./BeatmapSettingsSerializer";
import { BeatmapColorsSerializer } from "./BeatmapColorsSerializer";

export const BeatmapSerializer: Serializer<Beatmap> = {
  descriptor: buildClassSerialDescriptor('Beatmap', ({element}) => {
    element('metadata', BeatmapMetadataSerializer.descriptor);
    element('difficulty', BeatmapDifficultyInfoSerializer.descriptor);
    element('settings', BeatmapSettingsSerializer.descriptor);
    element('colors', BeatmapColorsSerializer.descriptor);
  }),
  serialize(encoder: Encoder, value: Beatmap) {
    const descriptor = this.descriptor
    encoder.encodeStructure(descriptor, encoder => {
      encoder.encodeSerializableElement(descriptor, 0, BeatmapMetadataSerializer, value.metadata);
      encoder.encodeSerializableElement(descriptor, 1, BeatmapDifficultyInfoSerializer, value.difficulty);
      encoder.encodeSerializableElement(descriptor, 2, BeatmapSettingsSerializer, value.settings);
      encoder.encodeSerializableElement(descriptor, 3, BeatmapColorsSerializer, value.colors);
    })
  },
  deserialize(decoder: Decoder): Beatmap {
    const descriptor = this.descriptor;

    return decoder.decodeStructure(descriptor, decoder =>
      new Beatmap(
        decoder.decodeSerializableElement(descriptor, 0, BeatmapMetadataSerializer),
        decoder.decodeSerializableElement(descriptor, 1, BeatmapDifficultyInfoSerializer),
        decoder.decodeSerializableElement(descriptor, 2, BeatmapSettingsSerializer),
        decoder.decodeSerializableElement(descriptor, 3, BeatmapColorsSerializer),
      )
    );
  }
}
