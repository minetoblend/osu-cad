import type { DDS, DDSAttributes, DDSFactory } from "../dds/index.js";

export class DDSFactoryRegistry
{
  readonly ddsFactories = new Map<string, DDSFactory<DDS>>();

  constructor(factories: DDSFactory<DDS>[])
  {
    for (const factory of factories)
    {
      if (this.ddsFactories.has(factory.attributes.type))
        throw new Error(`Duplicate entry for factory type ${factory.attributes.type}`);

      this.ddsFactories.set(factory.attributes.type, factory);
    }
  }

  get(attributes: DDSAttributes)
  {
    const factory = this.ddsFactories.get(attributes.type);

    if (factory && factory.attributes.version >= attributes.version)
      return factory;

    return undefined;
  }

  ensureSupported(attributeList: DDSAttributes[])
  {
    const unsupported: DDSAttributes[] = [];
    for (const attributes of attributeList)
    {
      if (!this.get(attributes))
        unsupported.push(attributes);
    }

    if (unsupported.length > 0)
      throw new Error(`${unsupported.length} unsupported types found: ${JSON.stringify(unsupported)}`);
  }
}
