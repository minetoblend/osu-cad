import { JsonObjectDecoder } from "./JsonObjectDecoder.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import type { JsonElement } from "./JsonElement.js";

export class JsonSparseObjectDecoder extends JsonObjectDecoder
{
  readonly #keys: string[];

  #index = 0;

  constructor(object: Record<string, JsonElement>)
  {
    super(object);

    this.#keys = Object.keys(object);
  }

  decodeElementIndex(descriptor: SerialDescriptor)
  {
    const name = this.#keys[this.#index ++];

    return descriptor.getElementIndex(name);
  }
}
