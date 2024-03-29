import { EditorUsersList } from '@/editor/connectedUsers.ts';
import { EditorEventsList } from '@/editor/events.ts';
import { BeatmapManager } from '@/editor/beatmapManager.ts';
import { EditorClock } from '@/editor/clock.ts';
import { SelectionManager } from '@/editor/selection.ts';
import { Mod } from '@/editor/mods/Mod.ts';
import { CommandManager } from '@/editor/commandHandler.ts';
import { AudioManager } from '@/editor/audio/AudioManager.ts';
import { Preferences } from '@osucad/common';
import { ToolManager } from '@/editor/tools/toolManager.ts';
import { InjectionKey } from 'vue';
import { EditorSocket } from '@/editor/editorSocket.ts';
import { ChatManager } from '@/editor/chat.ts';

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
