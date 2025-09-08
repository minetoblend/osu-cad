import type { DocumentRuntime } from "@osucad/multiplayer-core";
import { Document } from "./Document.js";
import { DocumentServiceFactory } from "./DocumentService.js";
import type { DocumentStorageService } from "./DocumentStorageService.js";

export interface IMultiplayerClientLoadOptions
{
  runtimeFactory: (
    storage: DocumentStorageService
  ) => Promise<DocumentRuntime>
}

export class MultiplayerClient
{
  public constructor()
  {
  }

  public async load(documentId: string, options: IMultiplayerClientLoadOptions)
  {
    const document = await Document.load({
      documentId,
      serviceFactory: new DocumentServiceFactory(),
      runtimeFactory: options.runtimeFactory,
    });

    return document;
  }
}
