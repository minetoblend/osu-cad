import {UserInfo} from "../types";

export interface ChatHistory {
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  user: UserInfo;
  message: string;
}