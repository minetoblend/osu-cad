import type { ChatMessage } from './ChatMessage';
import type { ClientInfo } from './types';

export type ServerMessage =
  | InitialStateServerMessage;

export interface ServerMessages {
  initialData(message: InitialStateServerMessage): void;

  userJoined(client: ClientInfo): void;

  userLeft(client: ClientInfo): void;

  chatMessageCreated(message: ChatMessage): void;
}

export interface InitialStateServerMessage {
  clientId: number;
  beatmapData: unknown;
  assets: AssetInfo[];
  connectedUsers: ClientInfo[];
}

export interface AssetInfo {
  path: string;
  id: string;
  filesize: number;
}

export interface UserJoinedServerMessage {
  clientId: number;
}
