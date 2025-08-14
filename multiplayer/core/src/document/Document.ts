import type { IDDSSummary, IDocumentSummary } from "@osucad/multiplayer-protocol";
import type { DDS, DDSFactoryOrConstructor, DDSInstanceType } from "../dds/index.js";
import { toDDSFactory } from "../dds/index.js";
import { DocumentRuntime } from "../runtime/index.js";
import { Encoder } from "../serialization/index.js";
import { nn } from "../utils/index.js";
import { attachRecursive } from "./attachRecursive.js";
import { DDSFactoryRegistry } from "../runtime/DDSFactoryRegistry.js";
import type { IdGenerator } from "../runtime/IdGenerator.js";
import { UUIDGenerator } from "../runtime/IdGenerator.js";
import type { IDeltaConnection } from "@osucad/multiplayer-client-definitions";

export type DocumentSchema = Record<string, DDSFactoryOrConstructor>;

export type DocumentServiceMap = Record<string, new (runtime: DocumentRuntime, document: Document<any, any>) => any>;

export type DocumentEntryPoint<Schema extends DocumentSchema> = { [K in keyof Schema]: DDSInstanceType<Schema[K]> };

export type DocumentServices<T extends DocumentServiceMap> = { [K in keyof T]: InstanceType<T[K]> };

export interface DocumentOptions<Schema extends DocumentSchema, Services extends DocumentServiceMap>
{
  readonly schema: Schema
  readonly types: DDSFactoryOrConstructor[]
  readonly idGenerator?: IdGenerator
  readonly services?: Services;
}

export type DetachedContainerOptions<Schema extends DocumentSchema, Services extends DocumentServiceMap> = DocumentOptions<Schema, Services>;

export interface LoadContainerOptions<Schema extends DocumentSchema, Services extends DocumentServiceMap> extends DocumentOptions<Schema, Services>
{
  readonly summary: IDocumentSummary
  readonly deltas: IDeltaConnection
}

export class Document<Schema extends DocumentSchema, Services extends DocumentServiceMap>
{
  get objects(): DocumentEntryPoint<Schema>
  {
    return this.#objects;
  }

  #objects!: DocumentEntryPoint<Schema>;

  get services(): DocumentServices<Services>
  {
    return this.#services;
  }

  #services!: DocumentServices<Services>;

  get runtime(): DocumentRuntime
  {
    return this.#runtime;
  }

  #runtime!: DocumentRuntime;

  static async createDetached<Schema extends DocumentSchema, Services extends DocumentServiceMap>(options: DetachedContainerOptions<Schema, Services>): Promise<Document<Schema, Services>>
  {
    const container = new Document<Schema, Services>();

    await container.#createDetached(options);

    return container;
  }

  static async load<Schema extends DocumentSchema, Services extends DocumentServiceMap>(options: LoadContainerOptions<Schema, Services>): Promise<Document<Schema, Services>>
  {
    const container = new Document<Schema, Services>();

    await container.#createAttached(options);

    return container;
  }

  async #createDetached({
    types,
    schema,
    idGenerator = new UUIDGenerator(),
  }: DetachedContainerOptions<Schema, Services>): Promise<void>
  {
    const typeRegistry = new DDSFactoryRegistry(types);

    const runtime = new DocumentRuntime({
      typeRegistry,
      idGenerator: idGenerator ?? new UUIDGenerator(),
    });

    const rootObjects: Record<string, DDS> = {};

    for (const key in schema)
    {
      const factory = toDDSFactory(schema[key]);

      typeRegistry.ensureSupported([factory.attributes]);

      rootObjects[key] =  factory.create();
    }

    attachRecursive(runtime, Object.values<DDS>(rootObjects));

    this.#objects = rootObjects as DocumentEntryPoint<Schema>;
    this.#runtime = runtime;
  }

  async #createAttached({
    types,
    schema,
    idGenerator = new UUIDGenerator(),
    summary,
  }: LoadContainerOptions<Schema, Services>)
  {
    const typeRegistry = new DDSFactoryRegistry(types);

    typeRegistry.ensureSupported(summary.schema.types);

    const runtime = new DocumentRuntime({
      typeRegistry,
      idGenerator,
    });

    await runtime.load(summary.objects);

    const rootObjects: Record<string, DDS> = {};

    for (const key in summary.schema)
    {
      const id = summary.schema.root[key];

      const dds = nn(runtime.getObject(id));

      const factory = schema[key] ? typeRegistry.get(schema[key].attributes) : undefined;

      if (dds.attributes.type !== factory?.attributes.type)
        throw new Error("Schema mismatch");

      rootObjects[key] = dds;
    }

    this.#objects = rootObjects as DocumentEntryPoint<Schema>;
    this.#runtime = runtime;
  }

  createSummary(): IDocumentSummary
  {
    const remaining: DDS[] = Object.values<DDS>(this.#objects);
    const tracked = new Set(remaining);

    const encoder = new Encoder();
    encoder.on("ddsEncoded", dds =>
    {
      if (!tracked.has(dds))
      {
        tracked.add(dds);
        remaining.push(dds);
      }
    });

    const objectSummaries: Record<string, IDDSSummary> = {};

    let current: DDS | undefined = remaining.pop();

    while (current)
    {
      objectSummaries[nn(current.id)] = {
        attributes: current.attributes,
        content: current.createSummary(encoder),
      };

      current = remaining.pop();
    }

    const rootIds: Record<string, string> = {};

    for (const key in this.objects)
      rootIds[key] = nn(this.objects[key].id);

    const types = this.runtime.typeRegistry.types().map(t => t.attributes);

    return {
      schema: {
        types,
        root: rootIds,
      },
      objects: objectSummaries,
    };
  }
}
