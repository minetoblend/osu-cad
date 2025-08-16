import type { IConnect, IConnected, IDocumentMessage, ISignalMessage } from "./messages.js";

export interface ClientMessages
{
  connectDocument(message: IConnect, callback: (result: IConnected) => void): void
  deltas(deltas: IDocumentMessage[]): void
  signal(message: ISignalMessage): void
}

export namespace ClientMessages
{
  export interface Delta
  {
    readonly targetId: string
    readonly content: unknown
  }
}
