import type { IClient } from "./IClient.js";
import type { IDocumentSummary } from "./Summary.js";

export interface ServerMessages
{
  delta(documentId: string, messages: ISequencedDeltaMessage[]): void;

  signal(documentId: string, message: ISignalMessage): void;
}

export interface ClientMessages
{
  connectDocument(documentId: string, callback: (message: IDocumentInitMessage) => void): void

  delta(documentId: string, deltas: IDeltaMessage[]): void

  signal(documentId: string, content: string, targetClientId?: string): void
}

export interface IDeltaMessage
{
  target: string;
  content: unknown;
}

export interface ISequencedDeltaMessage extends IDeltaMessage
{
  clientId: string;
  sequenceNumber: number;
}

export interface ISignalMessage
{
  clientId: string;
  content: string;
}

export interface IDocumentInitMessage
{
  readonly client: IClient;
  readonly summary: IDocumentSummary;
  readonly clients: IClient[]
}
