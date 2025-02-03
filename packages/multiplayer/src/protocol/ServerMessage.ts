import type { ClientInfo, SequencedOpsMessage, SummaryWithOps } from './types';

export type ServerMessage =
  | InitialStateServerMessage
  | UserJoinedServerMessage
  | UserLeftServerMessage
  | OpsSubmittedServerMessage
  | PresenceUpdatedServerMessage;

export interface InitialStateServerMessage {
  type: 'initial_state';
  clientId: number;
  document: SummaryWithOps;
  connectedUsers: ClientInfo[];
}

export interface UserJoinedServerMessage {
  type: 'user_joined';
  client: ClientInfo;
}

export interface UserLeftServerMessage {
  type: 'user_left';
  client: ClientInfo;
}

export interface OpsSubmittedServerMessage {
  type: 'ops_submitted';
  ops: SequencedOpsMessage[];
}

export interface PresenceUpdatedServerMessage {
  type: 'presence_updated';
  clientId: number;
  key: string;
  value: any;
}
