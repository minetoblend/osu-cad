import type { ClientInfo } from './types';

export interface ChatMessage {
  content: string;
  timestamp: number;
  user: ClientInfo;
}
