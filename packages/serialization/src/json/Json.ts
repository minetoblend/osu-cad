import type { SerializationStrategy } from '../Serializer';
import type { JsonElement } from './JsonElement';
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
    let result: JsonElement;
    new JsonTreeEncoder(this, node => result = node)
      .encodeSerializableValue(serializer, value);
    return result;
  }
}
