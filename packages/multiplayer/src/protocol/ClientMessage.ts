import type { SignalKey } from '../client';
import type { IMutation } from './IMutation';
import type { UserPresence } from './types';

export type ClientMessage =
  | never;

export interface ClientMessages {
  createChatMessage(content: string): void;
  submitSignal(key: SignalKey, data: any): void;
  updatePresence<Key extends keyof UserPresence>(key: Key, value: UserPresence[Key]): void;
  submitMutations(message: SubmitMutationsMessage): void;
}

export interface SubmitMutationsMessage {
  version: number;
  mutations: IMutation[];
}
