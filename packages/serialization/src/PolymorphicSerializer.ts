import type { Decoder } from './decoder/Decoder';
import type { SerialDescriptor } from './descriptor/SerialDescriptor';
import type { Encoder } from './encoder/Encoder';
import type { Serializer } from './Serializer';
import { CompositeDecoder } from './decoder/Decoder';

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
    let className: string | null = null;
    let value: any = null;

    decoder.decodeStructure(this.descriptor, (decoder) => {
      while (true) {
        const index = decoder.decodeElementIndex(this.descriptor);

        console.log(index);

        if (index === CompositeDecoder.DECODE_DONE)
          break;

        if (index === 0) {
          className = decoder.decodeStringElement(this.descriptor, index);
          console.log(className);
        }

        else if (index === 1) {
          console.assert(className !== null);
          const serializer = this.findPolymorphicSerializerByName(decoder, className!);
          value = decoder.decodeSerializableElement(this.descriptor, index, serializer);
        }

        else {
          throw new Error(/* TODO: Descriptive error message */);
        }
      }
    });

    if (value !== null)
      return value;

    throw new Error(/* TODO: Descriptive error message */);
  }

  findPolymorphicSerializer(encoder: Encoder, value: T): Serializer<T> {
    const serializer = this.findPolymorphicSerializerOrNull(encoder, value);
    if (!serializer)
      throw new Error(`No serializer found for ${value}`);

    return serializer;
  }

  findPolymorphicSerializerByName(decoder: CompositeDecoder, name: string): Serializer<T> {
    const serializer = this.findPolymorphicSerializerOrNullByName(decoder, name);
    if (!serializer)
      throw new Error(`No serializer found for ${name}`);

    return serializer;
  }

  abstract findPolymorphicSerializerOrNull(encoder: Encoder, value: T): Serializer<T> | null;

  abstract findPolymorphicSerializerOrNullByName(decoder: CompositeDecoder, name: string): Serializer<T> | null;
}
