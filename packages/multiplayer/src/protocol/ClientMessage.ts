import type { SignalKey } from '../client';
import type { IMutation } from './IMutation';

export type ClientMessage =
  | never;

export interface ClientMessages {
  createChatMessage(content: string): void;
  submitSignal(key: SignalKey, data: any): void;
  updatePresence(key: string, data: any): void;
  submitMutations(message: SubmitMutationsMessage): void;
}

export interface SubmitMutationsMessage {
  version: number;
  mutations: IMutation[];
}
