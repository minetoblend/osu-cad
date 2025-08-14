import type { IDisposable } from "./IDisposable.js";
import type { IDeltaMessage, IDocumentInitMessage, ServerMessages } from "@osucad/multiplayer-protocol";
import type { IErrorEvent, IEventEmitter } from "./events.js";

export interface IDocumentStorageService extends Partial<IDisposable>
{
  createBlob(data: ArrayBuffer): Promise<ICreateBlobResponse>

  readBlob(id: string): Promise<ArrayBuffer>
}

export interface ICreateBlobResponse
{
  id: string
}

export interface IDeltaConnectionEvents extends IErrorEvent, ServerMessages
{
  disconnect(reason: any): void;
}

export interface IDeltaConnection extends IEventEmitter<IDeltaConnectionEvents>, IDisposable
{
  readonly clientId: string;

  readonly initMessage: Promise<IDocumentInitMessage>

  submit(deltas: IDeltaMessage[]): void;

  submitSignal(content: string, targetClientId?: string): void;
}


export interface IDocumentService extends IDisposable
{
  connectToStorageService(): Promise<IDocumentStorageService>

  connectToDeltaStream(): Promise<IDeltaConnection>
}

export interface IDocumentServiceFactory
{
  createDocumentService(documentId: string): Promise<IDocumentService>
}
