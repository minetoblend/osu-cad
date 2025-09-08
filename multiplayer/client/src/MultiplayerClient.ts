import type { DocumentRuntime } from "@osucad/multiplayer-core";
import { Document } from "./Document.js";
import { DocumentServiceFactory } from "./DocumentService.js";
import type { DocumentStorageService } from "./DocumentStorageService.js";

export interface IMultiplayerClientOptions
{
  readonly endpoint: string
}

export interface IMultiplayerClientLoadOptions
{
  runtimeFactory: (
    storage: DocumentStorageService
  ) => Promise<DocumentRuntime>
}

export class MultiplayerClient
{
  public constructor(options: IMultiplayerClientOptions)
  {
    this.endpoint = options.endpoint;
  }

  private readonly endpoint: string;

  public async load(documentId: string, options: IMultiplayerClientLoadOptions)
  {
    return await Document.load({
      documentId,
      serviceFactory: new DocumentServiceFactory(this.endpoint),
      runtimeFactory: options.runtimeFactory,
    });
  }
}
