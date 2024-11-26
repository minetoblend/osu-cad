import type { Decoder } from './decoder/Decoder';
import type { SerialDescriptor } from './descriptor/SerialDescriptor';
import type { Encoder } from './encoder/Encoder';
import type { Serializer } from './Serializer';

export type Constructor<T> = new(...args: any[]) => T;

export abstract class AbstractPolymorphicSerializer<T> implements Serializer<T> {
  abstract readonly descriptor: SerialDescriptor;
  abstract readonly baseClass: Constructor<T>;

  serialize(encoder: Encoder, value: T) {
    const actualSerializer = this.findPolymorphicSerializer(encoder, value);
    encoder.encodeStructure(this.descriptor, (encoder) => {
      encoder.encodeStringElement(this.descriptor, 0, actualSerializer.descriptor.serialName);
      encoder.encodeSerializableElement(this.descriptor, 1, actualSerializer, value);
    });
  }

  deserialize(decoder: Decoder): T {
    throw new Error('Not implemented');
  }

  findPolymorphicSerializer(encoder: Encoder, value: T): Serializer<T> {
    const serializer = this.findPolymorphicSerializerOrNull(encoder, value);
    if (!serializer)
      throw new Error(`No serializer found for ${value}`);

    return serializer;
  }

  findPolymorphicSerializerByName(encoder: Encoder, name: string): Serializer<T> {
    const serializer = this.findPolymorphicSerializerOrNullByName(encoder, name);
    if (!serializer)
      throw new Error(`No serializer found for ${name}`);

    return serializer;
  }

  abstract findPolymorphicSerializerOrNull(encoder: Encoder, value: T): Serializer<T> | null;

  abstract findPolymorphicSerializerOrNullByName(encoder: Encoder, name: string): Serializer<T> | null;
}
