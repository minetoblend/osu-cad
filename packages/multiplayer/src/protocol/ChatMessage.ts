import type { ClientInfo } from './ServerMessage';

export interface ChatMessage {
  content: string;
  timestamp: number;
  user: ClientInfo;
}
