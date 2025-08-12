import type { ISerializer } from "./ISerializer.js";
import type { IDecoder, IEncoder } from "./types.js";

export class NullableSerializer<T> implements ISerializer<T | null>
{
  constructor(readonly serializer: ISerializer<T>)
  {
  }

  serialize(value: T | null, encoder: IEncoder)
  {
    if (value === null)
      return null;

    return this.serializer.serialize(value, encoder);
  }

  deserialize(value: unknown, decoder: IDecoder): T | null
  {
    if (value === null)
      return value;

    return this.serializer.deserialize(value, decoder);
  }
}
