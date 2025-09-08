import type { IDDSSummary } from "./Summary.js";

export enum MessageType
{
  Delta = "delta",
  Attach = "attach",
  BlobAttach = "blob_attach",
  ClientJoin = "client_join",
  ClientLeave = "client_leave",
}

export type IDocumentMessage =
  | IDeltaMessage
  | IAttachMessage;

export interface IDocumentMessageBase<Type extends MessageType>
{
  type: Type
}

export interface IDeltaMessage extends IDocumentMessageBase<MessageType.Delta>
{
  readonly type: MessageType.Delta
  readonly deltas: IEncodedDelta[]
}

export interface IEncodedDelta
{
  readonly target: string
  readonly content: unknown
}

export interface IAttachMessage extends IDocumentMessageBase<MessageType.Attach>
{
  readonly content: IAttachInfo[]
}

export interface IBlobAttachMessagae extends IDocumentMessageBase<MessageType.BlobAttach>
{
  id: string
}

export interface IClientJoin extends IDocumentMessageBase<MessageType.ClientJoin>
{
  client: IClient
}

export interface IClientLeave extends IDocumentMessageBase<MessageType.ClientLeave>
{
  clientId: string
}

export interface IAttachInfo
{
  readonly id: string
  readonly summary: IDDSSummary
}

export interface IConnect
{
  documentId: string
}

export interface IConnected
{
  readonly documentId: string
  readonly clientId: string;
  readonly sequenceNumber: number
  readonly clients: IClient[]
}

export interface IClient
{
  readonly clientId: string
}

export interface ISignalMessage
{
  target: string
  type: string
  content: unknown
}

export interface IRemoteSignalMessage extends ISignalMessage
{
  clientId: string
}


export type IRemoteDocumentMessage =
    | IRemoteDocumentMessage.Deltas
    | IRemoteDocumentMessage.ClientJoin
    | IRemoteDocumentMessage.ClientLeave;

export namespace IRemoteDocumentMessage
{
  export interface Deltas
  {
    type: "deltas"
    clientId: string
    content: IDocumentMessage[]
    sequenceNumber: number
  }

  export interface ClientJoin
  {
    type: "client_join"
    content: IClient
    sequenceNumber: number
  }

  export interface ClientLeave
  {
    type: "client_leave"
    content: string
    sequenceNumber: number
  }
}
