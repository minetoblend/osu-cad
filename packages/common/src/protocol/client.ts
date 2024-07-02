import { UserId } from './user';
import { Presence } from './presence';
import { IEditorCommand } from '../commands';

export interface ClientMessages {
  sendChatMessage(message: string): void;

  deleteChatMessage(id: number): void;

  sendCursorChat(message: string): void;

  setPresence(presence: Presence): void;

  commands(commands: IEditorCommand[]): void;

  kickUser(id: UserId, reason: string, isBan: boolean): void;
}
