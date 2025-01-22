import type { IVec2 } from '@osucad/framework';
import type { SignalKey } from '../client';
import type { ChatMessage } from './ChatMessage';
import type { IMutation } from './IMutation';
import type { ClientInfo, UserPresence } from './types';

export type ServerMessage =
  | InitialStateServerMessage;

export interface ServerMessages {
  initialData(message: InitialStateServerMessage): void;

  userJoined(client: ClientInfo): void;

  userLeft(client: ClientInfo): void;

  chatMessageCreated(message: ChatMessage): void;

  signal(clientId: number, key: SignalKey, data: any): void;

  presenceUpdated<Key extends keyof UserPresence>(clientId: number, key: Key, value: UserPresence[Key]): void;

  mutationsSubmitted(message: MutationsSubmittedMessage): void;
}

export interface InitialStateServerMessage {
  clientId: number;
  document: {
    summary: any;
    ops: MutationsSubmittedMessage[];
  };
  assets: AssetInfo[];
  connectedUsers: ClientInfo[];
}

export interface AssetInfo {
  path: string;
  id?: string;
  filesize?: number;
}

export interface UserJoinedServerMessage {
  clientId: number;
}

export interface UpdateCursorServerMessage {
  clientId: number;
  screen: string | null;
  position: IVec2 | null;
}

export interface MutationsSubmittedMessage {
  version: number;
  clientId: number;
  mutations: IMutation[];
  sequenceNumber: number;
}
