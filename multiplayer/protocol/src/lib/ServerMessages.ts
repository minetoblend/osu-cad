import type { IDocumentSummary } from "./Summary.js";
import type { IClient, IRemoteDocumentMessage, IRemoteSignalMessage } from "./messages.js";

export interface ServerMessages
{
  init(message: ServerMessages.Init): void;
  deltas(deltas: IRemoteDocumentMessage[]): void;
  signal(message: IRemoteSignalMessage): void
  clientJoin(client: IClient): void
  clientLeave(client: IClient): void
}

export namespace ServerMessages
{
  export interface Init
  {
    readonly clientId: string;
    readonly summary: IDocumentSummary;
  }
}
