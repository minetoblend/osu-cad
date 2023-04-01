import { ColorCycler } from "@osucad/common";
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
} from "@osucad/unison";
import { IWebSocket } from "./webSocket";
import { MessageDispatcher } from "./broadcast";
import { FileHandler } from "./files";

export class UnisonServer extends EventEmitter {
  private readonly logger = new Logger(UnisonServer.name);

  private readonly clients = new Map<string, IClient>();

  private readonly clientState = new Map<string, Map<string, any>>();

  private readonly messages = new MessageDispatcher<IClient>();

  private readonly signalHandler: SignalHandler;

  private readonly fileHandler: FileHandler;

  private readonly colorCycler = new ColorCycler();

  private lastLeaveAt: Date | null = null;

  constructor(
    public readonly id: string,
    public readonly document: Document<any>
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

    socket.on("submitOp", (message: IDocumentMessage | IDocumentMessage[]) => {
      const ops = Array.isArray(message) ? message : [message];

      ops.forEach((message) => {
        const start = performance.now();
        const op: IProcesessedDocumentMessage = {
          client,
          clientId: client.clientId,
          timestamp: Date.now(),
          path: message.path,
          content: message.content,
        };

        const obj = this.document.find(op.path);

        this.document.find(op.path)?.handle(op.content, false);

        this.messages.emit("op", op);
      });
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
}
