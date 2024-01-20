import {io, Socket} from "socket.io-client";
import {BeatmapId, ClientMessages, ServerMessages} from "@osucad/common";
import {createConnectedUsers, EditorUsersList} from "./connectedUsers.ts";
import {createEventList, EditorEventsList} from "./events.ts";
import {InjectionKey} from "vue";
import {createEditorTextures} from "./textures.ts";
import {BeatmapManager} from "./beatmapManager.ts";
import {EditorClock} from "./clock.ts";
import {SelectionManager} from "./selection.ts";
import {AudioManager} from "./audio/AudioManager.ts";
import {Mod} from "./mods/Mod.ts";
import {CommandManager} from "./commandHandler.ts";
import {Assets} from "pixi.js";
import "./operators/MoveHitObjectsOperator.ts";

export type EditorSocket = Socket<ServerMessages, ClientMessages>;

export interface EditorInstance {
  socket: EditorSocket;
  connectedUsers: EditorUsersList;
  events: EditorEventsList;
  beatmapManager: BeatmapManager;
  clock: EditorClock;
  selection: SelectionManager;
  mods: Mod[];
  commandManager: CommandManager;
  audioManager: AudioManager;
}

export const EditorInstance: InjectionKey<EditorInstance> = Symbol("editor");

export async function createEditorClient(
  beatmapId: BeatmapId,
): Promise<EditorInstance> {
  const socket = createClient(beatmapId);

  onScopeDispose(() => {
    socket.disconnect();
  });

  socket.on("disconnect", (event) => {
    window.location.reload();
  });

  const events = createEventList();
  const connectedUsers = createConnectedUsers(socket, events);
  const beatmapManager = new BeatmapManager(socket);
  const audioManager = new AudioManager(beatmapManager);
  const clock = new EditorClock(audioManager);
  const mods = [] as Mod[];
  const commandManager = new CommandManager(beatmapManager, socket);
  // mods.push(new DepthMod(clock));


  // watchEffect(() => {
  //   const metadata = beatmapManager.mapset?.meatadata;
  //   const diffName = beatmapManager.beatmap?.name;
  //   if (metadata && diffName)
  //     document.title = `${metadata.artist} - ${metadata.title} [${diffName}] - osucad`;
  // });

  await Promise.all([
    receiveRoomState(socket),
    createEditorTextures(),
  ]);

  const selection = new SelectionManager(beatmapManager);


  try {
    if (beatmapManager.beatmap.backgroundPath)
      await Assets.load(`https://osucad.com/api/mapsets/${beatmapManager.beatmap.setId}/files/${beatmapManager.beatmap.backgroundPath}`);
  } catch (e) {
    console.warn("failed to load background", e);
  }

  console.log("loading audio");

  await audioManager.loadAudio();

  clock.seek(beatmapManager.hitObjects.first?.startTime ?? 0, false);

  console.log("editor client created");

  return { socket, connectedUsers, events, beatmapManager, clock, selection, mods, commandManager, audioManager };
}

function createClient(beatmapId: BeatmapId): EditorSocket {
  const host = window.origin.replace(/^https/, "wss");

  return io(`${host}/editor`, {
    withCredentials: true,
    query: { id: beatmapId },
  });
}

function receiveRoomState(socket: EditorSocket): Promise<void> {
  return new Promise<void>((resolve) => {
    socket.once("roomState", () => {
      console.log("received room state");
      resolve();
    });
  });
}

export function provideEditor(editor: EditorInstance) {
  provide(EditorInstance, editor);
}

export function useEditor(): EditorInstance {
  const editor = inject(EditorInstance);
  if (!editor) {
    throw new Error("editor not found");
  }
  return editor;
}