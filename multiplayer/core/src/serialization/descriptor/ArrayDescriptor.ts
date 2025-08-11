import type { SerialDescriptor } from "./SerialDescriptor.js";
import { SerialKind } from "./SerialKind.js";

export class ArrayDescriptor implements SerialDescriptor
{
  constructor(readonly elementDescriptor: SerialDescriptor)
  {
  }

  readonly kind = SerialKind.Array;
  readonly elementCount = 1;

  getElementName(index: number): string
  {
    return index.toString();
  }

  getElementIndex(name: string): number
  {
    const index = Number.parseInt(name);
    if (!Number.isNaN(index))
      return index;

    throw new Error(`${name} is not a valid list index`);
  }

  getElementDescriptor(index: number): SerialDescriptor
  {
    return this.elementDescriptor;
  }

}
