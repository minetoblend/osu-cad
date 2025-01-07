import type { Decoder, Encoder, Serializer } from '@osucad/serialization';
import { Float32Serializer, listSerialDescriptor } from '@osucad/serialization';
import { Vec2 } from 'osucad-framework';

export const Vec2Serializer: Serializer<Vec2> = {
  descriptor: listSerialDescriptor(Float32Serializer.descriptor),
  deserialize(decoder: Decoder): Vec2 {
    return decoder.decodeStructure(this.descriptor, decoder =>
      new Vec2(
        decoder.decodeFloat32Element(this.descriptor, 0),
        decoder.decodeFloat32Element(this.descriptor, 1),
      ));
  },

  serialize(encoder: Encoder, value: Vec2) {
    const descriptor = this.descriptor;
    encoder.encodeStructure(descriptor, (encoder) => {
      encoder.encodeFloat32Element(descriptor, 0, value.x);
      encoder.encodeFloat32Element(descriptor, 1, value.y);
    });
  },
};
