import type { SerialKind } from "./SerialKind.js";

export interface SerialDescriptor
{
  readonly kind: SerialKind
  readonly elementCount: number
  getElementName(index: number): string
  getElementIndex(name: string): number
  getElementDescriptor(index: number): SerialDescriptor
}
