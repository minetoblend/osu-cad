import {
  buildClassSerialDescriptor, Decoder,
  Encoder,
  listSerialDescriptor,
  ListSerializer,
  Serializer,
  Uint32Serializer
} from "@osucad/serialization";
import { BeatmapColors } from "@osucad/common";
import { Color } from "pixi.js";

export const BeatmapColorsSerializer: Serializer<BeatmapColors> = {
  descriptor: buildClassSerialDescriptor('BeatmapColors', ({element}) => {
    element('comboColors', listSerialDescriptor(Uint32Serializer.descriptor));
  }),
  serialize(encoder: Encoder, value: BeatmapColors) {
    const descriptor = this.descriptor;
    encoder.encodeStructure(descriptor, encoder => {
      encoder.encodeSerializableElement(descriptor, 0, new ListSerializer(Uint32Serializer), value.comboColors.map(it => it.toNumber()));
    });
  },
  deserialize(decoder: Decoder): BeatmapColors {
    const descriptor = this.descriptor;

    const nested = decoder.beginStructure(descriptor);

    const colors = new BeatmapColors();

    for(const c of nested.decodeSerializableElement(descriptor, 0, new ListSerializer(Uint32Serializer)))
      colors.addComboColor(new Color(c));

    nested.endStructure(descriptor);

    return colors;
  }
}
