import type { Decoder } from '../decoder/Decoder';
import type { SerialDescriptor } from '../descriptor/SerialDescriptor';
import type { Encoder } from '../encoder/Encoder';
import type { Serializer } from '../Serializer';
import { nullableDescriptor, primitiveSerialDescriptor } from '../descriptor/SerialDescriptors';
import { PrimitiveKind } from '../descriptor/SerialKind';

export const BooleanSerializer: Serializer<boolean> = {
  descriptor: primitiveSerialDescriptor('boolean', PrimitiveKind.Boolean),

  serialize(encoder: Encoder, value: boolean): void {
    encoder.encodeBoolean(value);
  },

  deserialize(decoder: Decoder): boolean {
    return decoder.decodeBoolean();
  },
};

export const Uint8Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('u8', PrimitiveKind.Uint8),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= 0 && value <= 255);
    encoder.encodeUint8(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeInt8();
  },
};

export const Uint16Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('u16', PrimitiveKind.Uint16),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= 0 && value <= 65535);
    encoder.encodeUint16(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeInt16();
  },
};

export const Uint32Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('u32', PrimitiveKind.Uint32),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= 0 && value <= 4294967295);
    encoder.encodeUint32(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeInt32();
  },
};

export const Int8Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('i8', PrimitiveKind.Int8),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= -128 && value <= 127);
    encoder.encodeInt8(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeInt8();
  },
};

export const Int16Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('i16', PrimitiveKind.Int16),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= -32768 && value <= 32767);
    encoder.encodeInt16(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeInt16();
  },
};

export const Int32Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('i32', PrimitiveKind.Int32),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= -2147483648 && value <= 2147483647);
    encoder.encodeInt32(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeInt32();
  },
};

export const Float32Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('f32', PrimitiveKind.Float32),

  serialize(encoder: Encoder, value: number): void {
    encoder.encodeFloat32(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeFloat32();
  },
};

export const Float64Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('f64', PrimitiveKind.Float64),

  serialize(encoder: Encoder, value: number): void {
    encoder.encodeFloat64(value);
  },

  deserialize(decoder: Decoder): number {
    return decoder.decodeFloat64();
  },
};

export const StringSerializer: Serializer<string> = {
  descriptor: primitiveSerialDescriptor('string', PrimitiveKind.String),

  serialize(encoder: Encoder, value: string): void {
    encoder.encodeString(value);
  },

  deserialize(decoder: Decoder): string {
    return decoder.decodeString();
  },
};
export class NullableSerializer<T> implements Serializer<T | null> {
  constructor(private readonly serializer: Serializer<T>) {
    this.descriptor = nullableDescriptor(this.serializer.descriptor);
  }

  readonly descriptor: SerialDescriptor;

  serialize(encoder: Encoder, value: T | null): void {
    if (value === null) {
      encoder.encodeNull();
    }
    else {
      encoder.encodeNotNullMark();
      this.serializer.serialize(encoder, value);
    }
  }

  deserialize(decoder: Decoder): T | null {
    return decoder.decodeNotNullMark() ? this.serializer.deserialize(decoder) : decoder.decodeNull();
  }
}
