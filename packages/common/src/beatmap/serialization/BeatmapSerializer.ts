import type { Decoder, Encoder, Serializer } from '@osucad/serialization';
import type { HitObject } from '../../hitObjects/HitObject';
import { buildClassSerialDescriptor, listSerialDescriptor, ListSerializer } from '@osucad/serialization';
import { PolymorphicHitObjectSerializer } from '../../hitObjects/HitObject';
import { Beatmap } from '../Beatmap';
import { BeatmapColorsSerializer } from './BeatmapColorsSerializer';
import { BeatmapDifficultyInfoSerializer } from './BeatmapDifficultySerializer';
import { BeatmapMetadataSerializer } from './BeatmapMetadataSerializer';
import { BeatmapSettingsSerializer } from './BeatmapSettingsSerializer';

export class BeatmapSerializer implements Serializer<Beatmap> {
  readonly descriptor = buildClassSerialDescriptor('Beatmap', ({ element }) => {
    element('metadata', BeatmapMetadataSerializer.descriptor);
    element('difficulty', BeatmapDifficultyInfoSerializer.descriptor);
    element('settings', BeatmapSettingsSerializer.descriptor);
    element('colors', BeatmapColorsSerializer.descriptor);
    element('hitObjects', listSerialDescriptor(PolymorphicHitObjectSerializer.instance.descriptor));
  });

  serialize(encoder: Encoder, value: Beatmap) {
    const descriptor = this.descriptor;
    encoder.encodeStructure(descriptor, (encoder) => {
      encoder.encodeSerializableElement(descriptor, 0, BeatmapMetadataSerializer, value.metadata);
      encoder.encodeSerializableElement(descriptor, 1, BeatmapDifficultyInfoSerializer, value.difficulty);
      // encoder.encodeSerializableElement(descriptor, 2, BeatmapSettingsSerializer, value.settings);
      encoder.encodeSerializableElement(descriptor, 3, BeatmapColorsSerializer, value.colors);
      encoder.encodeSerializableElement(descriptor, 4, new ListSerializer(PolymorphicHitObjectSerializer.instance), value.hitObjects as unknown as HitObject[]);
    });
  }

  deserialize(decoder: Decoder): Beatmap {
    const descriptor = this.descriptor;

    return decoder.decodeStructure(descriptor, (decoder) => {
      const beatmap = new Beatmap(
        // TODO
        // decoder.decodeSerializableElement(descriptor, 0, BeatmapMetadataSerializer),
        // decoder.decodeSerializableElement(descriptor, 1, BeatmapDifficultyInfoSerializer),
        // decoder.decodeSerializableElement(descriptor, 2, BeatmapSettingsSerializer),
        // decoder.decodeSerializableElement(descriptor, 3, BeatmapColorsSerializer),

      );

      const hitObjects = decoder.decodeSerializableElement(descriptor, 4, new ListSerializer(PolymorphicHitObjectSerializer.instance));

      for (const hitObject of hitObjects)
        beatmap.hitObjects.add(hitObject);

      return beatmap;
    });
  }
}
