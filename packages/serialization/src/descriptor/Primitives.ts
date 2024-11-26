import type { SerialDescriptor } from './SerialDescriptor';
import type { PrimitiveKind } from './SerialKind';

export class PrimitiveSerialDescriptor implements SerialDescriptor {
  constructor(
    readonly serialName: string,
    readonly kind: PrimitiveKind,
  ) {
  }

  get elementsCount(): number {
    return 0;
  }

  get isNullable(): boolean {
    return false;
  }

  getElementName(index: number): string {
    throw new Error('Primitive descriptor does not have elements.');
  }

  getElementIndex(name: string): number {
    throw new Error('Primitive descriptor does not have elements.');
  }

  getElementDescriptor(index: number): SerialDescriptor {
    throw new Error('Primitive descriptor does not have elements.');
  }

  isElementOptional(index: number): boolean {
    throw new Error('Primitive descriptor does not have elements.');
  }
}

export function primitiveDescriptorSafe(serialName: string, kind: PrimitiveKind): SerialDescriptor {
  // TODO: check for built-in types

  return new PrimitiveSerialDescriptor(serialName, kind);
}
