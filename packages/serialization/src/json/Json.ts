import type { SerializationStrategy } from '../Serializer';
import type { JsonElement } from './JsonElement';
import { JsonTreeEncoder } from './JsonEncoder';

export class Json {
  encode<T>(
    serializer: SerializationStrategy<T>,
    value: T,
  ) {
    let result: JsonElement;
    new JsonTreeEncoder(this, node => result = node)
      .encodeSerializableValue(serializer, value);
    return result;
  }
}
