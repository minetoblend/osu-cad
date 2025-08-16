import type { IDDSSummary, IDocumentSummary } from "./Summary.js";

export enum MessageType
{
  Delta = "delta",
  Attach = "attach",
}

export type IDocumentMessage =
  | IDeltaMessage
  | IAttachMessage;

export interface IDocumentMessageBase<Type extends MessageType>
{
  type: Type
}

export type IRemoteDocumentMessage<T extends IDocumentMessage = IDocumentMessage> = T & {
  clientId: string
  sequenceNumber: number
};

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
  readonly summary: IDocumentSummary;
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
