import type { IVec2 } from '@osucad/framework';
import type { SignalKey } from '../client';

export type ClientMessage =
  | never;

export interface ClientMessages {
  createChatMessage(content: string): void;
  submitSignal(key: SignalKey, data: any): void;
  updatePresence(key: string, data: any): void;
}

export interface UpdateCursorClientMessage {
  screen: string | null;
  position: IVec2 | null;
}
