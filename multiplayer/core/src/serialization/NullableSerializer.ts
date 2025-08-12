import type { ISerializer } from "./ISerializer.js";
import type { IDecoder, IEncoder } from "./types.js";

export class NullableSerializer<T, Plain> implements ISerializer<T | null, Plain | null>
{
  constructor(readonly serializer: ISerializer<T, Plain>)
  {
  }

  serialize(value: T | null, encoder: IEncoder): Plain | null
  {
    if (value === null)
      return null;

    return this.serializer.serialize(value, encoder);
  }

  deserialize(value: Plain | null, decoder: IDecoder): T | null
  {
    if (value === null)
      return null;

    return this.serializer.deserialize(value, decoder);
  }
}
