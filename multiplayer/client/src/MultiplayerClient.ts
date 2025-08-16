import type { DocumentRuntime } from "@osucad/multiplayer-core";
import { Document } from "./Document";
import { DocumentServiceFactory } from "./DocumentService";

export interface IMultiplayerClientLoadOptions
{
  runtimeFactory: () => Promise<DocumentRuntime>
}

export class MultiplayerClient
{
  constructor()
  {
  }

  async load(documentId: string, options: IMultiplayerClientLoadOptions)
  {
    const document = await Document.load({
      documentId,
      serviceFactory: new DocumentServiceFactory(),
      runtimeFactory: options.runtimeFactory,
    });

    return document;
  }
}
