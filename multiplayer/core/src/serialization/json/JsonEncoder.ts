import type { ICompositeEncoder, IEncoder } from "../encoding/IEncoder.js";
import { AbstractEncoder } from "../encoding/AbstractEncoder.js";
import type { JsonElement } from "./JsonElement.js";
import { JsonObjectEncoder } from "./JsonObjectEncoder.js";
import { nn } from "../../utils/nn.js";
import type { DDS } from "../../dds/DDS.js";

export class JsonEncoder extends AbstractEncoder
{
  constructor(
    readonly consumer: (value: JsonElement) => void,
  )
  {
    super();
  }

  public override encodeValue(value: unknown): void
  {
    this.consumer(value as JsonElement);
  }

  public override encodeObject(encode: (encoder: ICompositeEncoder) => void): void
  {
    const encoder = new JsonObjectEncoder();

    encode(encoder);

    this.encodeValue(encoder.content);
  }

  public override encodeSparseObject(size: number, encode: (encoder: ICompositeEncoder) => void): void
  {
    return this.encodeObject(encode);
  }

  public override encodeArray(length: number, encode: (encoder: IEncoder) => void): void
  {
    const result: JsonElement[] = [];

    const encoder = new JsonEncoder(value => result.push(value));

    encode(encoder);

    this.encodeValue(result);
  }

  public override encodeDDS(value: DDS): void
  {
    this.encodeValue(nn(value.id));
  }
}
