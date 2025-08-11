import type { SerialDescriptor } from "./SerialDescriptor.js";
import { SerialKind } from "./SerialKind.js";

export class PrimitiveDescriptor implements SerialDescriptor
{
  readonly kind = SerialKind.Primitive;

  readonly elementCount = 0;

  public getElementName(index: number): string
  {
    throw new Error("Primitive descriptor does not have elements.");
  }

  public getElementIndex(name: string): number
  {
    throw new Error("Primitive descriptor does not have elements.");
  }

  public getElementDescriptor(index: number): SerialDescriptor
  {
    throw new Error("Primitive descriptor does not have elements.");
  }
}

export const primitiveDescriptor = new PrimitiveDescriptor();
