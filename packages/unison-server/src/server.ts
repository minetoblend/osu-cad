import { Server } from "socket.io";
import {
  BeatmapColors,
  BeatmapDifficulty,
  ColorCycler,
  HitObjectCollection,
  TimingPointCollection,
} from "@osucad/common";
import { EventEmitter } from "stream";
import { SignalHandler } from "./signals";
import { Logger } from "@nestjs/common";
import {
  IObjectSnapshot,
  Document,
  IDocumentMessage,
  IDocumentSnapshot,
  IProcesessedDocumentMessage,
  IClient,
  ISortedCollectionSnapshotData,
} from "@osucad/unison";
import { IWebSocket } from "./webSocket";
import { MessageDispatcher } from "./broadcast";
import { FileHandler } from "./files";

export class UnisonServer extends EventEmitter {
  private readonly logger = new Logger(UnisonServer.name);

  private readonly clients = new Map<number, IClient>();

  private readonly clientState = new Map<number, Map<string, any>>();

  private readonly messages = new MessageDispatcher<IClient>();

  private readonly signalHandler: SignalHandler;

  private readonly fileHandler: FileHandler;

  private readonly colorCycler = new ColorCycler();

  private lastLeaveAt: Date | null = null;

  public isDirty = true;

  constructor(
    public readonly id: string,
    public readonly document: Document<any>,
    public readonly io: Server
  ) {
    super();
    this.signalHandler = new SignalHandler(
      this.messages.topic("signal", "submitSignal")
    );
    this.fileHandler = new FileHandler(
      this.messages.topic("file", "uploadFile")
    );
  }

  accept(client: IClient, socket: IWebSocket) {
    client.data.color = this.colorCycler.next();

    this.logger.log(
      `${client.user.name} (${client.clientId}) connected to server ${this.id}`
    );

    socket.joinRoom(this.id);

    this.clients.set(client.clientId, client);
    this.clientState.set(client.clientId, new Map<string, any>());

    const snapshot: IObjectSnapshot<IDocumentSnapshot> = {
      attributes: this.document.attributes,
      content: this.document.createSnapshot(),
    };

    this.messages.connect(socket, client);

    this.messages.emit("userJoined", client, [...this.clients.values()]);

    socket.emit("snapshot", snapshot);

    socket.emit(
      "initClientState",
      [...this.clientState.entries()].map(([clientId, state]) => ({
        clientId,
        state: [...state.entries()],
      }))
    );

    socket.on("submitOp", (message: IDocumentMessage[] | IDocumentMessage) => {
      const ops = Array.isArray(message) ? message : [message];
      const time = performance.now();
      const sequencedOps = ops.map((message) => {
        const op: IProcesessedDocumentMessage = {
          clientId: client.clientId,
          path: message.path,
          content: message.content,
        };

        const obj = this.document.find(op.path);

        if (!obj) console.log("could not find object for ", op.path);

        obj?.handle(op.content, false);

        return op;
      });

      this.isDirty = true;

      this.io.to(this.id).emit("op", sequencedOps);
    });

    socket.on("submitClientState", ({ key, value }) => {
      const state = this.clientState.get(client.clientId)!;
      state.set(key, value);
      this.messages.emit("clientState", { client, key, value });
    });

    socket.on("disconnect", () => {
      this.logger.log(`${client.user.name} (${client.clientId}) disconnected`);
      this.clients.delete(client.clientId);
      this.clientState.delete(client.clientId);
      this.messages.emit("userLeft", client, [...this.clients.values()]);
      this.lastLeaveAt = new Date();
    });
  }

  get clientCount() {
    return this.clients.size;
  }

  createSnapshot() {
    const { hitObjects, timing, colors, difficulty } = this.document.objects;

    return {
      hitObjects: (
        hitObjects as HitObjectCollection
      ).createSnapshotWithAttributes(),
      timing: (timing as TimingPointCollection).createSnapshotWithAttributes(),
      colors: (colors as BeatmapColors).createSnapshotWithAttributes(),
      difficulty: difficulty as BeatmapDifficulty,
    };
  }
}
