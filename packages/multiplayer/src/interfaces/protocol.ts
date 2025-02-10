export enum MessageType {
  ClientJoin = 'join',
  ClientLeave = 'leave',
  Operation = 'op',
}

export interface IConnectMessage {
  documentId: string;
}
