import type { IDocumentSummary } from "./Summary.js";
import type { IDocumentMessage, IRemoteDocumentMessage } from "./messages.js";

export interface ServerMessages
{
  init(message: ServerMessages.Init): void;

  deltas(deltas: IRemoteDocumentMessage<IDocumentMessage>[]): void;

  signal(clientId: number, target: string, type: string, signal: unknown): void
}

export namespace ServerMessages
{
  export interface Init
  {
    readonly clientId: number;
    readonly summary: IDocumentSummary;
  }
}
