import type { IClientEndpoints } from "./IClientEndpoints.js";
import { DocumentServiceFactory } from "./DocumentServiceFactory.js";
import type { DDSFactoryOrConstructor, DocumentRuntime, DocumentSchema, DocumentServiceMap } from "@osucad/multiplayer-core";
import { Document, ObjectDDS } from "@osucad/multiplayer-core";

export interface LoadDocumentOptions<Schema extends DocumentSchema, Services extends DocumentServiceMap>
{
  readonly schema: Schema
  readonly types: DDSFactoryOrConstructor[]
  readonly services?: Services
}

export class MultiplayerClient
{
  constructor(readonly endpoints: IClientEndpoints)
  {
  }

  async load<Schema extends DocumentSchema, Services extends DocumentServiceMap>(documentId: string, options: LoadDocumentOptions<Schema, Services>): Promise<Document<Schema, Services>>
  {
    const serviceFactory = new DocumentServiceFactory(this.endpoints);

    const documentService = await serviceFactory.createDocumentService(documentId);

    const { schema, types } = options;

    const deltas = await documentService.connectToDeltaStream();

    const { summary } = await deltas.initMessage;

    return await Document.load({
      schema,
      types,
      summary,
      deltas,
    });
  }
}

class Foo
{
  constructor(readonly runtime: DocumentRuntime)
  {
  }

  foo()
  {}
}

class Bar extends ObjectDDS
{
  static attributes = { type: "bar", version: 0 };

  constructor()
  {
    super(Bar.attributes);
  }
}

new MultiplayerClient({ deltas: "/", blobs: "" }).load("", {
  types: [],
  schema: {
    Bar,
  },
  services: {
    Foo,
  },
}).then(document =>
{
  document.services.Foo.foo();
});
