import type { IDocumentSummary } from "./Summary.js";

export interface ServerMessages
{
  init(message: ServerMessages.Init): void;

  deltas(clientId: number, deltas: ServerMessages.Delta[]): void;
}

export namespace ServerMessages
{
  export interface Init
  {
    readonly clientId: number;
    readonly summary: IDocumentSummary;
  }

  export interface Delta
  {
    readonly targetId: string;
    readonly content: unknown;
  }
}
