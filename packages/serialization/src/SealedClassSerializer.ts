import type { SerialDescriptor } from './descriptor/SerialDescriptor';
import type { Encoder } from './encoder/Encoder';
import type { Constructor } from './PolymorphicSerializer';
import type { Serializer } from './Serializer';
import { StringSerializer } from './builtins/BuildinSerializers';
import { buildSerialDescriptor } from './descriptor/SerialDescriptors';
import { PolymorphicKind, SerialKind } from './descriptor/SerialKind';
import { AbstractPolymorphicSerializer } from './PolymorphicSerializer';
import { Lazy } from './utils/Lazy';

export class SealedClassSerializer<T extends object> extends AbstractPolymorphicSerializer<T> {
  constructor(
    serialName: string,
    readonly baseClass: Constructor<T>,
    subclasses: Constructor<T>[],
    subclassSerializers: Serializer<T>[],
  ) {
    super();

    this.#class2Serializer = new Map(subclasses.map((it, index) => [it, subclassSerializers[index]]));
    this.#serialName2Serializer = new Map([...this.#class2Serializer.values()].map(serializer =>
      [
        serializer.descriptor.serialName,
        serializer,
      ],
    ));

    this.#descriptor = new Lazy(() =>
      buildSerialDescriptor(serialName, PolymorphicKind.SEALED, ({ element }) => {
        element('type', StringSerializer.descriptor);
        const elementDescriptor = buildSerialDescriptor(`Sealed<${this.baseClass.name}>`, SerialKind.Contextual, ({ element }) => {
          this.#serialName2Serializer.forEach((serializer, name) => {
            element(name, serializer.descriptor);
          });
        });
        element('value', elementDescriptor);
      }),
    );
  }

  readonly #class2Serializer: Map<Constructor<T>, Serializer<T>>;
  readonly #serialName2Serializer = new Map<string, Serializer<T>>();

  readonly #descriptor: Lazy<SerialDescriptor>;

  get descriptor() {
    return this.#descriptor.value;
  }

  override findPolymorphicSerializerOrNull(encoder: Encoder, value: T): Serializer<T> | null {
    return this.#class2Serializer.get((value as any).constructor) ?? null;
  }

  override findPolymorphicSerializerOrNullByName(encoder: Encoder, name: string): Serializer<T> | null {
    return this.#serialName2Serializer.get(name) ?? null;
  }
}
