import type { Json } from './Json';
import type { JsonElement } from './JsonElement';
import { JsonEncoder } from './JsonEncoder';

const PRIMITIVE_TAG = 'primitive';

export class JsonPrimitiveEncoder extends JsonEncoder {
  private content: JsonElement | null = null;

  constructor(json: Json, nodeConsumer: (node: JsonElement) => void) {
    super(json, nodeConsumer);
    this.pushTag(PRIMITIVE_TAG);
  }

  protected override putElement(tag: string, element: JsonElement) {
    console.assert(tag === PRIMITIVE_TAG);
    console.assert(this.content === null);
    this.content = element;
    this.nodeConsumer(element);
  }

  protected override getCurrent(): JsonElement {
    console.assert(this.content !== null);
    return this.content!;
  }
}
