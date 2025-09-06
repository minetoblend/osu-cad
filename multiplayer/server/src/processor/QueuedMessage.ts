import type { IClient, IDocumentMessage, ISignalMessage } from "@osucad/multiplayer-protocol";

export type QueuedMessage =
    | QueuedMessage.Deltas
    | QueuedMessage.ClientJoin
    | QueuedMessage.ClientLeave
    | QueuedMessage.Signal;

export namespace QueuedMessage
{
  export interface Deltas
  {
    type: "deltas"
    clientId: string
    content: IDocumentMessage[]
  }

  export interface ClientJoin
  {
    type: "client_join"
    client: IClient
  }

  export interface ClientLeave
  {
    type: "client_leave"
    clientId: string
  }

  export interface Signal
  {
    type: "signal"
    clientId: string
    content: ISignalMessage
  }
}
