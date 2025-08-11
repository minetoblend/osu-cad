import type { ISerializer } from "./types.js";
import type { IEncoder } from "./encoding/IEncoder.js";
import type { IDecoder } from "./decoding/IDecoder.js";
import type { SerialDescriptor } from "./descriptor/SerialDescriptor.js";

export class NullableSerializer<T> implements ISerializer<T | null>
{
  constructor(
    readonly serializer: ISerializer<T>,
  )
  {
    this.descriptor = serializer.descriptor;
  }

  descriptor: SerialDescriptor;

  serialize(encoder: IEncoder, value: T | null): void
  {
    if (value === null)
    {
      encoder.encodeNull();
    }
    else
    {
      encoder.encodeNotNullMark();
      this.serializer.serialize(encoder, value);
    }
  }
  deserialize(decoder: IDecoder): T | null
  {
    if (decoder.decodeNotNullMark())
      return this.serializer.deserialize(decoder);

    return decoder.decodeNull();
  }
}
