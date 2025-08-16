import type { IConnect, IConnected, IDocumentMessage } from "./messages.js";

export interface ClientMessages
{
  connectDocument(message: IConnect, callback: (result: IConnected) => void): void
  deltas(deltas: IDocumentMessage[]): void
  signal(target: string, type: string, signal: unknown): void
}

export namespace ClientMessages
{
  export interface Delta
  {
    readonly targetId: string
    readonly content: unknown
  }
}
