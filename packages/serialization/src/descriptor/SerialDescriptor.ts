import type { SerialKind } from './SerialKind';

export interface SerialDescriptor {
  readonly serialName: string;
  readonly kind: SerialKind;
  readonly isNullable: boolean;
  readonly elementsCount: number;
  getElementName(index: number): string;
  getElementIndex(name: string): number;
  getElementDescriptor(index: number): SerialDescriptor;
  isElementOptional(index: number): boolean;
}
