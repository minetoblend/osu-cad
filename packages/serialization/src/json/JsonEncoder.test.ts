import type { Encoder } from '../encoder/Encoder';
import type { Serializer } from '../Serializer';
import { Float32Serializer, Float64Serializer } from '../builtins/BuildinSerializers';
import { buildClassSerialDescriptor } from '../descriptor/SerialDescriptorImpl';
import { Json } from './Json';

describe('jsonEncoder', () => {
  it('should encode object', () => {
    class Vec2 {
      constructor(public x: number, public y: number) {
      }
    }

    const Vec2Serializer: Serializer<Vec2> = {
      descriptor: buildClassSerialDescriptor(
        'Vec2',
        ({ element }) => {
          element('x', Float32Serializer.descriptor, false);
          element('y', Float32Serializer.descriptor, false);
        },
      ),

      serialize(encoder: Encoder, value: Vec2) {
        const descriptor = this.descriptor;

        encoder.encodeStructure(descriptor, (encoder) => {
          encoder.encodeFloat32Element(descriptor, 0, value.x);
          encoder.encodeFloat32Element(descriptor, 1, value.y);
        });
      },
    };

    const json = new Json();

    expect(
      json.encode(Vec2Serializer, new Vec2(2, 3)),
    )
      .toEqual({ x: 2, y: 3 });

    class HitObject {
      constructor(
        readonly position: Vec2,
        readonly startTime: number,
      ) {
      }
    }

    const HitObjectSerializer: Serializer<HitObject> = {
      descriptor: buildClassSerialDescriptor(
        'HitObject',
        ({ element }) => {
          element('position', Vec2Serializer.descriptor, false);
          element('startTime', Float64Serializer.descriptor, false);
        },
      ),

      serialize(encoder: Encoder, value: HitObject) {
        const descriptor = this.descriptor;

        encoder.encodeStructure(descriptor, (encoder) => {
          encoder.encodeSerializableElement(descriptor, 0, Vec2Serializer, value.position);
          encoder.encodeFloat64Element(descriptor, 1, value.startTime);
        });
      },
    };

    expect(
      json.encode(HitObjectSerializer, new HitObject(new Vec2(2, 3), 4)),
    )
      .toEqual({
        position: { x: 2, y: 3 },
        startTime: 4,
      });
  });
});
