import type { ICompositeEncoder } from "../encoding/IEncoder.js";
import type { JsonElement } from "./JsonElement.js";
import { TaggedEncoder } from "../encoding/TaggedEncoder.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import type { ISerializationStrategy } from "../types.js";
import { JsonEncoder } from "./JsonEncoder.js";
import type { DDS } from "../../dds/DDS.js";
import { nn } from "../../utils/nn.js";

export class JsonObjectEncoder extends TaggedEncoder<string> implements ICompositeEncoder
{
  constructor()
  {
    super();
  }

  readonly content: Record<string, JsonElement> = {};

  protected override getTag(descriptor: SerialDescriptor, index: number): string
  {
    return descriptor.getElementName(index);
  }

  public override encodeTaggedValue(tag: string, value: unknown): void
  {
    this.content[tag] = value as JsonElement;
  }

  protected override encodeSerializableValue<T>(serializer: ISerializationStrategy<T>, value: T): void
  {
    const tag = this.popTag();

    serializer.serialize(new JsonEncoder(result => this.content[tag] = result), value);
  }

  protected override encodeTaggedNull(tag: string): void
  {
    this.encodeTaggedValue(tag, null);
  }

  protected override encodeTaggedDDS(tag: string, value: DDS): void
  {
    this.encodeTaggedValue(tag, nn(value.id));
  }
}
