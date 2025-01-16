import type { IVec2 } from '@osucad/framework';
import type { Decoder, Encoder, SerialDescriptor, Serializer, SerialKind } from '@osucad/serialization';
import type { Matrix } from 'pixi.js';
import { Vec2 } from '@osucad/framework';
import { Float32Serializer, nullableDescriptor, StringSerializer, StructureKind } from '@osucad/serialization';
import { PathType } from './PathType';

export interface IPathPoint {
  position: IVec2;
  type: PathType | null;
}

export class PathPoint {
  constructor(
    readonly position: Vec2,
    readonly type: PathType | null = null,
  ) {
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  withPosition(position: Vec2) {
    return new PathPoint(position, this.type);
  }

  withType(type: PathType | null) {
    return new PathPoint(this.position, type);
  }

  clone() {
    return new PathPoint(this.position.clone(), this.type);
  }

  static linear(position: Vec2) {
    return new PathPoint(position, PathType.Linear);
  }

  moveBy(offset: Vec2) {
    return this.withPosition(this.position.add(offset));
  }

  transformBy(matrix: Matrix) {
    return this.withPosition(matrix.apply(this.position, new Vec2()));
  }

  toPlain(): IPathPoint {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      type: this.type,
    };
  }
}

export class PathPointSerialDescriptor implements SerialDescriptor {
  readonly elementsCount: number = 3;
  readonly isNullable: boolean = false;
  readonly kind: SerialKind = StructureKind.LIST;
  readonly serialName: string = 'PathPoint';

  getElementDescriptor(index: number): SerialDescriptor {
    if (index === 0)
      return nullableDescriptor(StringSerializer.descriptor);

    return Float32Serializer.descriptor;
  }

  getElementIndex(name: string): number {
    return Number.parseInt(name);
  }

  getElementName(index: number): string {
    return index.toString();
  }

  isElementOptional(index: number): boolean {
    return index === 2;
  }
}

export class PathPointSerializer implements Serializer<PathPoint> {
  readonly descriptor: SerialDescriptor = new PathPointSerialDescriptor();

  deserialize(decoder: Decoder): PathPoint {
    return decoder.decodeStructure(this.descriptor, (decoder) => {
      const x = decoder.decodeFloat32Element(this.descriptor, 0);
      const y = decoder.decodeFloat32Element(this.descriptor, 1);
      const type = decoder.decodeNullableSerializableElement(this.descriptor, 2, StringSerializer);

      return new PathPoint(new Vec2(x, y), type !== null ? (PathType[type as any] as unknown as PathType) : null);
    });
  }

  serialize(encoder: Encoder, value: PathPoint): void {
    encoder.encodeStructure(this.descriptor, (encoder) => {
      encoder.encodeFloat32Element(this.descriptor, 0, value.x);
      encoder.encodeFloat32Element(this.descriptor, 1, value.y);
      if (value.type !== null)
        encoder.encodeNullableSerializableElement(this.descriptor, 2, StringSerializer, PathType[value.type]);
    });
  }
}
