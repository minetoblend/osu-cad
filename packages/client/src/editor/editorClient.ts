import { io } from 'socket.io-client';
import { BeatmapId } from '@osucad/common';
import { createConnectedUsers } from './connectedUsers.ts';
import { createEventList } from './events.ts';
import { createEditorTextures } from './textures.ts';
import { BeatmapManager } from './beatmapManager.ts';
import { EditorClock } from './clock.ts';
import { SelectionManager } from './selection.ts';
import { AudioManager } from './audio/AudioManager.ts';
import { Mod } from './mods/Mod.ts';
import { CommandManager } from './commandHandler.ts';
import { Assets } from 'pixi.js';
import { usePreferences } from '@/composables/usePreferences.ts';
import { ToolManager } from '@/editor/tools/toolManager.ts';
import { EditorSocket } from '@/editor/editorSocket.ts';
import { EditorContext, globalEditor } from '@/editor/editorContext.ts';
import fontUrl from '@fontsource/nunito-sans/files/nunito-sans-cyrillic-400-normal.woff2';
import { Ref } from 'vue';

export async function createEditorClient(
  beatmapId: BeatmapId,
  progress: Ref<number> = ref(0),
): Promise<EditorContext> {
  const socket = createClient(beatmapId);

  progress.value = 0.1;

  onScopeDispose(() => {
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    window.location.reload();
  });

  const events = createEventList();
  const connectedUsers = createConnectedUsers(socket, events);
  const beatmapManager = new BeatmapManager(socket);
  const audioManager = new AudioManager(beatmapManager);
  const clock = new EditorClock(audioManager);
  const mods = [] as Mod[];
  const commandManager = new CommandManager(beatmapManager, socket);
  const { preferences, loaded: preferencesLoaded } = usePreferences();

  await Promise.all([
    receiveRoomState(socket),
    createEditorTextures(),
    until(preferencesLoaded).toBeTruthy(),
  ]);

  progress.value = 0.4;

  const tools = new ToolManager();
  const selection = new SelectionManager(beatmapManager);

  try {
    if (beatmapManager.beatmap.backgroundPath)
      await Assets.load(
        `/api/mapsets/${beatmapManager.beatmap.setId}/files/${beatmapManager.beatmap.backgroundPath}`,
      );

    await Assets.load(fontUrl);
  } catch (e) {
    console.warn('failed to load background', e);
  }

  progress.value = 0.5;

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
  };

  globalEditor.value = ctx;

  progress.value = 1.0;

  return ctx;
}

function createClient(beatmapId: BeatmapId): EditorSocket {
  const host = window.origin.replace(/^https/, 'wss');

  return io(`${host}/editor`, {
    withCredentials: true,
    query: { id: beatmapId },
  });
}

function receiveRoomState(socket: EditorSocket): Promise<void> {
  return new Promise<void>((resolve) =>
    socket.once('roomState', () => resolve()),
  );
}
