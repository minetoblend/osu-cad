import type { Encoder } from '../encoder/Encoder';
import type { Serializer } from '../Serializer';
import { primitiveSerialDescriptor } from '../descriptor/SerialDescriptorImpl';
import { PrimitiveKind } from '../descriptor/SerialKind';

export const BooleanSerializer: Serializer<boolean> = {
  descriptor: primitiveSerialDescriptor('boolean', PrimitiveKind.Boolean),

  serialize(encoder: Encoder, value: boolean): void {
    encoder.encodeBoolean(value);
  },
};

export const Uint8Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('u8', PrimitiveKind.Uint8),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= 0 && value <= 255);
    encoder.encodeUint8(value);
  },
};

export const Uint16Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('u16', PrimitiveKind.Uint16),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= 0 && value <= 65535);
    encoder.encodeUint16(value);
  },
};

export const Uint32Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('u32', PrimitiveKind.Uint32),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= 0 && value <= 4294967295);
    encoder.encodeUint32(value);
  },
};

export const Int8Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('i8', PrimitiveKind.Int8),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= -128 && value <= 127);
    encoder.encodeInt8(value);
  },
};

export const Int16Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('i16', PrimitiveKind.Int16),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= -32768 && value <= 32767);
    encoder.encodeInt16(value);
  },
};

export const Int32Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('i32', PrimitiveKind.Int32),

  serialize(encoder: Encoder, value: number): void {
    console.assert(Number.isInteger(value) && value >= -2147483648 && value <= 2147483647);
    encoder.encodeInt32(value);
  },
};

export const Float32Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('f32', PrimitiveKind.Float32),

  serialize(encoder: Encoder, value: number): void {
    encoder.encodeFloat32(value);
  },
};

export const Float64Serializer: Serializer<number> = {
  descriptor: primitiveSerialDescriptor('f64', PrimitiveKind.Float64),

  serialize(encoder: Encoder, value: number): void {
    encoder.encodeFloat64(value);
  },
};

export const StringSerializer: Serializer<string> = {
  descriptor: primitiveSerialDescriptor('string', PrimitiveKind.String),

  serialize(encoder: Encoder, value: string): void {
    encoder.encodeString(value);
  },
};
