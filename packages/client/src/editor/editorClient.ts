import {io} from "socket.io-client";
import {BeatmapId} from "@osucad/common";
import {createConnectedUsers} from "./connectedUsers.ts";
import {createEventList} from "./events.ts";
import {createEditorTextures} from "./textures.ts";
import {BeatmapManager} from "./beatmapManager.ts";
import {EditorClock} from "./clock.ts";
import {SelectionManager} from "./selection.ts";
import {AudioManager} from "./audio/AudioManager.ts";
import {Mod} from "./mods/Mod.ts";
import {CommandManager} from "./commandHandler.ts";
import {Assets} from "pixi.js";
import "./operators/MoveHitObjectsOperator.ts";
import {usePreferences} from "@/composables/usePreferences.ts";
import {ToolManager} from "@/editor/tools/toolManager.ts";
import {EditorSocket} from "@/editor/editorSocket.ts";
import {EditorContext} from "@/editor/editorContext.ts";


export async function createEditorClient(
    beatmapId: BeatmapId,
): Promise<EditorContext> {
  const socket = createClient(beatmapId);

  onScopeDispose(() => {
    socket.disconnect();
  });

  socket.on("disconnect", () => {
    window.location.reload();
  });

  const events = createEventList();
  const connectedUsers = createConnectedUsers(socket, events);
  const beatmapManager = new BeatmapManager(socket);
  const audioManager = new AudioManager(beatmapManager);
  const clock = new EditorClock(audioManager);
  const mods = [] as Mod[];
  const commandManager = new CommandManager(beatmapManager, socket);
  const {preferences, loaded: preferencesLoaded} = usePreferences();
  const tools = new ToolManager();

  await Promise.all([
    receiveRoomState(socket),
    createEditorTextures(),
    until(preferencesLoaded).toBeTruthy(),
  ]);

  const selection = new SelectionManager(beatmapManager);


  try {
    if (beatmapManager.beatmap.backgroundPath)
      await Assets.load(`/api/mapsets/${beatmapManager.beatmap.setId}/files/${beatmapManager.beatmap.backgroundPath}`);
  } catch (e) {
    console.warn("failed to load background", e);
  }

  console.log("loading audio");

  await audioManager.loadAudio();

  clock.seek(beatmapManager.hitObjects.first?.startTime ?? 0, false);

  console.log("editor client created");

  return {
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
}

function createClient(beatmapId: BeatmapId): EditorSocket {
  const host = window.origin.replace(/^https/, "wss");

  return io(`${host}/editor`, {
    withCredentials: true,
    query: {id: beatmapId},
  });
}

function receiveRoomState(socket: EditorSocket): Promise<void> {
  return new Promise<void>(resolve =>
      socket.once("roomState", () => resolve())
  );
}