import { SerialDescriptor, SerialKind, StructureKind } from "@osucad/serialization";

export class ListDescriptor implements SerialDescriptor {
  constructor(
    readonly elementDescriptor: SerialDescriptor,
  ) {

  }

  get elementsCount() {
    return 1;
  }

  get kind() {
    return StructureKind.LIST;
  }

  get isNullable() {
    return false;
  }

  get serialName() {
    return `List<${this.elementDescriptor.serialName}>`;
  }

  getElementDescriptor(index: number): SerialDescriptor {
    return this.elementDescriptor;
  }

  getElementIndex(name: string): number {
    const index = Number.parseInt(name);
    if (!Number.isNaN(index)) return index;

    throw new Error(`${name} is not a valid list index`);
  }

  getElementName(index: number): string {
    return index.toString();
  }

  isElementOptional(index: number): boolean {
    return false;
  }
}
