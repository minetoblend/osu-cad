import { EditorUsersList } from '@/editorOld/connectedUsers.ts';
import { EditorEventsList } from '@/editorOld/events.ts';
import { BeatmapManager } from '@/editorOld/beatmapManager.ts';
import { EditorClock } from '@/editorOld/clock.ts';
import { SelectionManager } from '@/editorOld/selection.ts';
import { Mod } from '@/editorOld/mods/Mod.ts';
import { CommandManager } from '@/editorOld/commandHandler.ts';
import { AudioManager } from '@/editorOld/audio/AudioManager.ts';
import { Preferences } from '@osucad/common';
import { ToolManager } from '@/editorOld/tools/toolManager.ts';
import { InjectionKey } from 'vue';
import { EditorSocket } from '@/editorOld/editorSocket.ts';
import { ChatManager } from '@/editorOld/chat.ts';

export interface EditorContext {
  socket: EditorSocket;
  connectedUsers: EditorUsersList;
  events: EditorEventsList;
  beatmapManager: BeatmapManager;
  clock: EditorClock;
  selection: SelectionManager;
  mods: Mod[];
  commandManager: CommandManager;
  audioManager: AudioManager;
  preferences: Preferences;
  tools: ToolManager;
  chat: ChatManager;
}

export const EditorContext: InjectionKey<EditorContext> = Symbol('editor');

export const globalEditor = shallowRef<EditorContext>();

export function useEditor(): EditorContext {
  const editor = globalEditor.value;
  if (!editor) {
    throw new Error('editor not found');
  }
  return editor;
}
