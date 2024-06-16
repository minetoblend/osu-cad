import { io } from 'socket.io-client';
import { createConnectedUsers } from './connectedUsers.ts';
import { createEventList } from './events.ts';
import { BeatmapManager } from './beatmapManager.ts';
import { EditorClock } from './clock.ts';
import { SelectionManager } from './selection.ts';
import { AudioManager } from './audio/AudioManager.ts';
import { Mod } from './mods/Mod.ts';
import { CommandManager } from './commandHandler.ts';
import { usePreferences } from '@/composables/usePreferences.ts';
import { ToolManager } from '@/editorOld/tools/toolManager.ts';
import { EditorSocket } from '@/editorOld/editorSocket.ts';
import { EditorContext, globalEditor } from '@/editorOld/editorContext.ts';
import { Ref } from 'vue';
import { ChatManager } from '@/editorOld/chat.ts';
import { loadAssets, loadBackgorund } from '@/editorOld/assets.ts';

export async function createEditorClient(
  joinKey: string,
  progress: Ref<number> = ref(0),
): Promise<EditorContext> {
  const socket = createSocket(joinKey);

  progress.value = 0.1;

  onScopeDispose(() => {
    socket.disconnect();
  });

  let pageLeaveInProgress = false;

  socket.on('disconnect', () => {
    if (pageLeaveInProgress) return;
    window.location.reload();
    pageLeaveInProgress = true;
  });

  socket.on('kicked', () => {
    if (pageLeaveInProgress) return;
    window.location.href = '/';
    pageLeaveInProgress = true;
  });

  const events = createEventList();
  const connectedUsers = createConnectedUsers(socket, events);
  const beatmapManager = new BeatmapManager(socket);
  const audioManager = new AudioManager(beatmapManager);
  const clock = new EditorClock(audioManager);
  const mods = [] as Mod[];
  const commandManager = new CommandManager(beatmapManager, socket);
  const { preferences, loaded: preferencesLoaded } = usePreferences();
  const chat = new ChatManager(socket);

  await Promise.all([
    receiveRoomState(socket),
    loadAssets(),
    until(preferencesLoaded).toBeTruthy(),
  ]);

  progress.value = 0.4;

  await loadBackgorund(beatmapManager.beatmap);

  progress.value = 0.5;

  const tools = new ToolManager();
  const selection = new SelectionManager(beatmapManager);

  console.log('loading audio');

  await audioManager.loadAudio((p) => (progress.value = 0.5 + p * 0.5));

  await clock.seek(beatmapManager.hitObjects.first?.startTime ?? 0, false);

  console.log('editor client created');

  const ctx: EditorContext = {
    socket,
    connectedUsers,
    events,
    beatmapManager,
    clock,
    selection,
    mods,
    commandManager,
    audioManager,
    preferences,
    tools,
    chat,
  };

  globalEditor.value = ctx;

  progress.value = 1.0;

  return ctx;
}

export function createSocket(joinKey: string): EditorSocket {
  const host = window.origin.replace(/^https/, 'wss');
  const socket = io(`${host}/editor`, {
    withCredentials: true,
    query: { id: joinKey },
    transports: ['websocket'],
  });
  return new EditorSocket(socket);
}

function receiveRoomState(socket: EditorSocket): Promise<void> {
  return new Promise<void>((resolve) =>
    socket.once('beatmap', () => resolve()),
  );
}
