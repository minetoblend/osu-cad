import type { DeserializationStrategy, SerializationStrategy } from '../Serializer';
import type { JsonElement } from './JsonElement';
import { JsonTreeDecoder } from './JsonDecoder';
import { JsonTreeEncoder } from './JsonEncoder';

export interface JsonConfiguration {
  ignoreUnknownKeys: boolean;
  classDiscriminator: string;
}

export class Json {
  static defaultConfiguration: JsonConfiguration = {
    ignoreUnknownKeys: false,
    classDiscriminator: 'type',
  };

  configuration: JsonConfiguration;

  constructor(configuration: Partial<JsonConfiguration> = {}) {
    this.configuration = { ...Json.defaultConfiguration, ...configuration };
  }

  encode<T>(
    serializer: SerializationStrategy<T>,
    value: T,
  ) {
    let result: JsonElement = null;
    new JsonTreeEncoder(this, node => result = node)
      .encodeSerializableValue(serializer, value);
    return result;
  }

  decode<T>(
    serializer: DeserializationStrategy<T>,
    value: JsonElement,
  ): T {
    // TODO: handle cases when we're not decoding an object
    return new JsonTreeDecoder(this, value).decodeSerializableValue(serializer);
  }

  readPolymorphicJson<T>(
    discriminator: string,
    element: JsonElement & object,
    deserializer: DeserializationStrategy<T>,
  ): T {
    return new JsonTreeDecoder(this, element, discriminator, deserializer.descriptor).decodeSerializableValue(deserializer);
  }
}
