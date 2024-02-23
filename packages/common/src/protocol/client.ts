import { fields, payload, TypeNames, variantModule, VariantOf } from 'variant';
import { UserId } from './user';
import { Presence } from './presence';
import { EditorCommand } from './commands';

export const ClientMessage = variantModule({
  kickUser: fields<{ id: UserId; reason: string; isBan: boolean }>(),
  sendChatMessage: fields<{ message: string }>(),
  leave: fields(),
  setPresence: fields<Presence>(),
  setRole: fields<{ id: UserId; role: string }>(),
  commands: payload<EditorCommand>(),
});

export type ClientMessage<T extends TypeNames<typeof ClientMessage>> =
  VariantOf<typeof ClientMessage, T>;

export type VersionedEditorCommand = {
  command: EditorCommand;
  version: number;
};

export interface ClientMessages {
  kickUser(id: UserId, reason: string, isBan: boolean): void;

  sendChatMessage(message: string): void;

  leave(): void;

  setPresence(presence: Presence): void;

  setRole(id: UserId, role: string): void;

  commands(commands: Uint8Array): void;

  roll(): void;
}
