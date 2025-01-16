import type { IVec2 } from '@osucad/framework';
import type { SignalKey } from '../client';
import type { ChatMessage } from './ChatMessage';
import type { ClientInfo } from './types';

export type ServerMessage =
  | InitialStateServerMessage;

export interface ServerMessages {
  initialData(message: InitialStateServerMessage): void;

  userJoined(client: ClientInfo): void;

  userLeft(client: ClientInfo): void;

  chatMessageCreated(message: ChatMessage): void;

  signal(clientId: number, key: SignalKey, data: any): void;

  presenceUpdated(clientId: number, key: string, data: any): void;
}

export interface InitialStateServerMessage {
  clientId: number;
  beatmapData: unknown;
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
