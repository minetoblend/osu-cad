import type { SerialDescriptor } from './SerialDescriptor';
import type { SerialKind } from './SerialKind';
import { primitiveDescriptorSafe } from './Primitives';
import { PrimitiveKind, StructureKind } from './SerialKind';
import { ListDescriptor } from "./ListDescriptor";

export function buildClassSerialDescriptor(
  serialName: string,
  builder: (builder: ClassSerialDescriptorBuilder) => void,
  typeParameters: SerialDescriptor[] = [],
) {
  const classBuilder = new ClassSerialDescriptorBuilder(serialName);
  builder(classBuilder);
  return new SerialDescriptors(
    serialName,
    StructureKind.CLASS,
    classBuilder.elementNames.length,
    typeParameters,
    classBuilder,
  );
}

export function primitiveSerialDescriptor(
  serialName: string,
  kind: PrimitiveKind,
) {
  console.assert(serialName.length > 0, 'Blank serial names are prohibited.');
  return primitiveDescriptorSafe(serialName, kind);
}

export function serialDescriptor(
  serialName: string,
  original: SerialDescriptor,
): SerialDescriptor {
  console.assert(serialName.length !== 0, 'Blank serial names are prohibited');
  console.assert(!(original.kind instanceof PrimitiveKind), 'For primitive descriptors please use \'PrimitiveSerialDescriptor\' instead');
  console.assert(serialName !== original.serialName, `The name of the wrapped descriptor (${serialName}) cannot be the same as the name of the original descriptor (${original.serialName})`);

  return new WrappedSerialDescriptor(serialName, original);
}

class WrappedSerialDescriptor implements SerialDescriptor {
  constructor(
    readonly serialName: string,
    readonly original: SerialDescriptor,
  ) {
  }

  get kind() {
    return this.original.kind;
  }

  get isNullable() {
    return this.original.isNullable;
  }

  get elementsCount() {
    return this.original.elementsCount;
  }

  getElementName(index: number) {
    return this.original.getElementName(index);
  }

  getElementIndex(name: string) {
    return this.original.getElementIndex(name);
  }

  getElementDescriptor(index: number) {
    return this.original.getElementDescriptor(index);
  }

  isElementOptional(index: number) {
    return this.original.isElementOptional(index);
  }
}

export function buildSerialDescriptor(
  serialName: string,
  kind: SerialKind,
  builder: (builder: ClassSerialDescriptorBuilder) => void,
  typeParameters: SerialDescriptor[] = [],
) {
  console.assert(serialName.length > 0, 'Blank serial names are prohibited.');
  console.assert(kind !== StructureKind.CLASS, 'For StructureKind.CLASS please use \'buildClassSerialDescriptor\' instead');
  const classBuilder = new ClassSerialDescriptorBuilder(serialName);
  builder(classBuilder);
  return new SerialDescriptors(
    serialName,
    kind,
    classBuilder.elementNames.length,
    typeParameters,
    classBuilder,
  );
}

class ClassSerialDescriptorBuilder {
  constructor(
    readonly serialName: string,
  ) {
  }

  isNullable: boolean = false;

  elementNames: string[] = [];

  uniqueNames: Set<string> = new Set();

  elementDescriptors: SerialDescriptor[] = [];

  elementOptionality: boolean[] = [];

  element = (
    elementName: string,
    descriptor: SerialDescriptor,
    isOptional: boolean = false,
  ) => {
    if (this.uniqueNames.has(elementName))
      throw new Error('Element name is not unique');

    this.elementNames.push(elementName);
    this.elementDescriptors.push(descriptor);
    this.elementOptionality.push(isOptional);
    this.uniqueNames.add(elementName);
  };
}

export class SerialDescriptors implements SerialDescriptor {
  constructor(
    readonly serialName: string,
    readonly kind: SerialKind,
    readonly elementsCount: number,
    typeParameters: SerialDescriptor[] = [],
    builder: ClassSerialDescriptorBuilder,
  ) {
    this.serialNames = new Set(builder.elementNames);
    this.elementNames = builder.elementNames;
    this.elementDescriptors = builder.elementDescriptors;
    this.elementOptionality = builder.elementOptionality;

    this.name2Index = new Map();
    for (let i = 0; i < this.elementNames.length; i++)
      this.name2Index.set(this.elementNames[i], i);

    this.typeParametersDescriptors = typeParameters;
  }

  private readonly serialNames: Set<string>;
  private readonly elementNames: string[];
  private readonly elementDescriptors: SerialDescriptor[];
  private readonly elementOptionality: boolean[];
  private readonly name2Index: Map<string, number>;
  private readonly typeParametersDescriptors: SerialDescriptor[] = [];

  getElementName(index: number): string {
    return this.elementNames[index];
  }

  getElementIndex(name: string): number {
    return this.name2Index.get(name) ?? -1;
  }

  getElementDescriptor(index: number): SerialDescriptor {
    return this.elementDescriptors[index];
  }

  isElementOptional(index: number): boolean {
    return this.elementOptionality[index];
  }

  isNullable = false;
}

export function nullableDescriptor(
  original: SerialDescriptor,
): SerialDescriptor {
  if (original.isNullable)
    return original;

  return new NullableDescriptor(original);
}

class NullableDescriptor implements SerialDescriptor {
  constructor(
    readonly original: SerialDescriptor,
  ) {
  }

  get serialName() {
    return this.original.serialName;
  }

  get kind() {
    return this.original.kind;
  }

  get isNullable() {
    return true;
  }

  get elementsCount() {
    return this.original.elementsCount;
  }

  getElementName(index: number) {
    return this.original.getElementName(index);
  }

  getElementIndex(name: string) {
    return this.original.getElementIndex(name);
  }

  getElementDescriptor(index: number) {
    return this.original.getElementDescriptor(index);
  }

  isElementOptional(index: number) {
    return this.original.isElementOptional(index);
  }
}

export function listSerialDescriptor(elementDescriptor: SerialDescriptor): SerialDescriptor {
  return new ListDescriptor(elementDescriptor);
}
