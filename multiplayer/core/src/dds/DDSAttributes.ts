import type { ISerializer } from "../serialization/types.js";
import { primitiveDescriptor } from "../serialization/descriptor/PrimitiveDescriptor.js";
import type { IEncoder } from "../serialization/encoding/IEncoder.js";
import { ObjectDescriptor } from "../serialization/descriptor/ObjectDescriptor.js";
import type { SerialDescriptor } from "../serialization/descriptor/SerialDescriptor.js";
import type { IDecoder } from "../serialization/decoding/IDecoder.js";

export interface DDSAttributes
{
  readonly type: string
  readonly version: number
}

export class DDSAttributesSerializer implements ISerializer<DDSAttributes>
{


  readonly descriptor: SerialDescriptor = new ObjectDescriptor([
    { name: "type", descriptor: primitiveDescriptor },
    { name: "version", descriptor: primitiveDescriptor },
  ]);

  public serialize(encoder: IEncoder, value: DDSAttributes): void
  {
    encoder.encodeObject(encoder =>
    {
      encoder.encodeStringElement(this.descriptor, 0, value.type);
      encoder.encodeUint8Element(this.descriptor, 0, value.version);
    });
  }

  public deserialize(decoder: IDecoder): DDSAttributes
  {
    return decoder.decodeObject(decoder =>
    {
      return {
        type: decoder.decodeStringElement(this.descriptor, 0),
        version: decoder.decodeUint8Element(this.descriptor, 1),
      };
    });
  }
}

export namespace DDSAttributes
{
  export const serializer = new DDSAttributesSerializer();
}
