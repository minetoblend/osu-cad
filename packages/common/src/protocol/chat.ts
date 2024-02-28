import { UserInfo } from '../types';

export interface ChatHistory {
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  user: UserInfo | 'server';
  timestamp: number;
  message: ChatFragment[];
}

export type ChatFragment =
  | { text: string; type?: undefined }
  | { type: 'newline' }
  | { text: string; type: 'mention'; mention: number }
  | { text: string; type: 'code' }
  | { text: string; type: 'timestamp'; time: number; objects: number[] };
