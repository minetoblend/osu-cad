import { UserId } from './user';
import { Presence } from './presence';
import { EditorCommand } from './commands';

export type VersionedEditorCommand = {
  command: EditorCommand;
  version: number;
};

export interface ClientMessages {
  sendChatMessage(message: string): void;

  deleteChatMessage(id: number): void;

  sendCursorChat(message: string): void;

  setPresence(presence: Presence): void;

  commands(commands: Uint8Array): void;

  kickUser(id: UserId, reason: string, isBan: boolean): void;
}
