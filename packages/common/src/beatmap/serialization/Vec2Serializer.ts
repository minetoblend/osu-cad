import {
  buildClassSerialDescriptor,
  buildSerialDescriptor,
  Decoder,
  Encoder,
  Float32Serializer, listSerialDescriptor,
  Serializer, StructureKind
} from "@osucad/serialization";
import { Vec2 } from "osucad-framework";


export const Vec2Serializer: Serializer<Vec2> = {
  descriptor: listSerialDescriptor(Float32Serializer.descriptor),
  deserialize(decoder: Decoder): Vec2 {
    return decoder.decodeStructure(this.descriptor, decoder =>
      new Vec2(
        decoder.decodeFloat32Element(this.descriptor, 0),
        decoder.decodeFloat32Element(this.descriptor, 1)
      )
    );
  },

  serialize(encoder: Encoder, value: Vec2) {
    const descriptor = this.descriptor;
    const nested = encoder.beginCollection(descriptor)
    nested.encodeFloat32Element(descriptor, 0, value.x);
    nested.encodeFloat32Element(descriptor, 1, value.y);
    nested.endStructure(descriptor);

  }
}
