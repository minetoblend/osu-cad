import type { Decoder, Encoder, Serializer } from '@osucad/serialization';
import { buildClassSerialDescriptor, Float32Serializer, Float64Serializer, listSerialDescriptor, ListSerializer, Uint8Serializer } from '@osucad/serialization';
import { BeatmapEditorSettings } from '../BeatmapEditorSettings';

export const BeatmapEditorSettingsSerializer: Serializer<BeatmapEditorSettings> = {
  descriptor: buildClassSerialDescriptor('BeatmapEditorSettings', ({ element }) => {
    element('bookmarks', listSerialDescriptor(Float64Serializer.descriptor));
    element('distanceSpacing', Float32Serializer.descriptor);
    element('beatDivisor', Uint8Serializer.descriptor);
    element('gridSize', Uint8Serializer.descriptor);
    element('timelineZoom', Float32Serializer.descriptor);
  }),

  deserialize(decoder: Decoder): BeatmapEditorSettings {
    const settings = new BeatmapEditorSettings();

    decoder.decodeStructure(this.descriptor, (decoder) => {
      settings.bookmarks = decoder.decodeSerializableElement(this.descriptor, 0, new ListSerializer(Float64Serializer));
      settings.distanceSpacing = decoder.decodeSerializableElement(this.descriptor, 1, Float32Serializer);
      settings.beatDivisor = decoder.decodeSerializableElement(this.descriptor, 2, Uint8Serializer);
      settings.gridSize = decoder.decodeSerializableElement(this.descriptor, 3, Uint8Serializer);
      settings.timelineZoom.value = decoder.decodeSerializableElement(this.descriptor, 4, Float32Serializer);
    });

    return settings;
  },

  serialize(encoder: Encoder, value: BeatmapEditorSettings) {
    encoder.encodeStructure(this.descriptor, (encoder) => {
      encoder.encodeSerializableElement(this.descriptor, 0, new ListSerializer(Float64Serializer), value.bookmarks);
      encoder.encodeSerializableElement(this.descriptor, 1, Float32Serializer, value.distanceSpacing);
      encoder.encodeSerializableElement(this.descriptor, 2, Uint8Serializer, value.beatDivisor);
      encoder.encodeSerializableElement(this.descriptor, 3, Uint8Serializer, value.gridSize);
      encoder.encodeSerializableElement(this.descriptor, 4, Float32Serializer, value.timelineZoom.value);
    });
  },
};
