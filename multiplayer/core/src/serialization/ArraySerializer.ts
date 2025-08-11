import type { ISerializer } from "./types.js";
import type { IEncoder } from "./encoding/IEncoder.js";
import type { IDecoder } from "./decoding/IDecoder.js";
import { ArrayDescriptor } from "./descriptor/ArrayDescriptor.js";
import type { SerialDescriptor } from "./descriptor/SerialDescriptor.js";

export class ArraySerializer<T> implements ISerializer<T[]>
{
  constructor(readonly serializer: ISerializer<T>)
  {
    this.descriptor = new ArrayDescriptor(serializer.descriptor);
  }

  readonly descriptor: SerialDescriptor;

  public serialize(encoder: IEncoder, value: T[]): void
  {
    encoder.encodeArray(value.length, encoder =>
    {
      for (let i = 0; i < value.length; i++)
        encoder.encodeSerializableValue(this.serializer, value[i]);
    });
  }

  public deserialize(decoder: IDecoder): T[]
  {
    return decoder.decodeArray((length, decoder) =>
    {
      const result: T[] = [];

      for (let i = 0; i < length; i++)
        result.push(decoder.decodeSerializableValue(this.serializer));

      return result;
    });
  }
}
