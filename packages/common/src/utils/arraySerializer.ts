import type { ISerializer } from '@osucad/multiplayer';

export function arraySerializer<T, V>(serializer: ISerializer<T, V>): ISerializer<T[], V[]> {
  return {
    serialize(value: T[]): V[] {
      return value.map(serializer.serialize);
    },
    deserialize(plain: V[]): T[] {
      return plain.map(serializer.deserialize);
    },
  };
}
