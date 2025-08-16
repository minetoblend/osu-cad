import type { IDocumentSummary } from "./Summary.js";
import type { IDocumentMessage, IRemoteDocumentMessage } from "./messages.js";

export interface ServerMessages
{
  init(message: ServerMessages.Init): void;

  deltas(deltas: IRemoteDocumentMessage[]): void;

  signal(clientId: string, target: string, type: string, signal: unknown): void
}

export namespace ServerMessages
{
  export interface Init
  {
    readonly clientId: string;
    readonly summary: IDocumentSummary;
  }
}
