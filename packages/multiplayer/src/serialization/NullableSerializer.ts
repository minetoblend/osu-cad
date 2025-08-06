import type { Serializer } from "./Serializer";
import type { BinaryWriter } from "./BinaryWriter";
import type { BinaryReader } from "./BinaryReader";

export class NullableSerializer<T> implements Serializer<T | null>
{
  constructor(readonly serializer: Serializer<T>)
  {
  }

  encode(value: T | null, writer: BinaryWriter)
  {
    if (value !== null)
    {
      writer.writeBoolean(true);
      this.serializer.encode(value, writer);
    }
    else
    {
      writer.writeBoolean(false);
    }
  }

  decode(reader: BinaryReader)
  {
    const isNotNull = reader.readBoolean();

    if (isNotNull)
      return this.serializer.decode(reader);

    return null;
  }
}
