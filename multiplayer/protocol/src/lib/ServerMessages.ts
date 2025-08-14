import type { IDocumentSummary } from "./Summary.js";
import type { IClient } from "./IClient.js";

export interface ServerMessages
{
  init(message: ServerMessages.Init): void;

  deltas(clientId: number, deltas: ServerMessages.Delta[]): void;

  signal(clientId: number, target: string, type: string, signal: unknown): void

  clientJoin(client: IClient): void

  clientLeave(client: IClient): void
}

export namespace ServerMessages
{
  export interface Init
  {
    readonly clientId: number;
    readonly summary: IDocumentSummary;
    readonly clients: IClient[]
  }

  export interface Delta
  {
    readonly targetId: string;
    readonly content: unknown;
  }
}
