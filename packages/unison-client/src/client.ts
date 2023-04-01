import { UserManager } from "./users";
import { ITypeFactory } from "@osucad/unison";
import {
  IDocumentMessage,
  IProcesessedDocumentMessage,
  IUnisonRuntime,
  SharedObject,
  nn,
} from "@osucad/unison";
import EventEmitter from "events";
import { SignalManager } from "./signal";
import { IUnisonTokenProvider } from "./token";
import { Socket, io } from "socket.io-client";
import { Document, SharedRegister } from "@osucad/unison";
import { UnisonClientRuntime } from "./runtime";

export class UnisonClient {
  private readonly endpoint: string;
  private readonly tokenProvider: IUnisonTokenProvider;

  constructor(endpoint: string, tokenProvider: IUnisonTokenProvider) {
    this.endpoint = endpoint;
    this.tokenProvider = tokenProvider;
  }

  async connect<TSchema extends object = { [key: string]: SharedObject }>(
    documentId: string,
    types?: ITypeFactory[]
  ): Promise<IUnisonContainer<TSchema>> {
    const token = await this.tokenProvider.getToken(documentId);

    const connection = new UnisonClientConnection(
      this.endpoint,
      token,
      documentId
    );

    const runtime = new UnisonClientRuntime(types) as IUnisonRuntime;
    const document = new Document<TSchema>(runtime);
    const signals = new SignalManager(connection);
    const users = new UserManager(connection);

    await new Promise<void>((resolve) => {
      connection.once("snapshot", (snapshot: any) => {
        document.restore(snapshot);
        resolve();
      });
    });

    runtime.on("opSubmitted", function submitOp(object, op, localOpMetadata) {
      connection.submitOp({
        path: nn(object.path),
        content: op,
        clientMetadata: {
          object,
        },
      });
    });

    connection.on("op", (op: IProcesessedDocumentMessage) => {
      const start = performance.mark("opReceived");
      const isLocal = op.clientId === connection.id;
      const object = document.find(op.path);
      if (object) {
        object.handle(op.content, isLocal);
      }
    });

    const disconnect = () => {
      connection.disconnect();
    };

    return {
      document,
      signals,
      disconnect,
      runtime,
      users,
      id: documentId,
      connection,
    };
  }
}

export interface IUnisonContainer<TSchema extends object = any> {
  id: string;
  document: Document<TSchema>;
  signals: SignalManager;
  users: UserManager;
  runtime: IUnisonRuntime;
  connection: UnisonClientConnection;
  disconnect(): void;
}

export class UnisonClientConnection extends EventEmitter {
  socket: Socket;
  id: string;
  constructor(endpoint: string, token: string, documentId: string) {
    super();
    const socket = io(endpoint, {
      auth: {
        token: token,
        documentId: documentId,
      },
      transportOptions: ["polling", "websocket"],
    });
    socket.on("connect", () => {
      this.id = socket.id;
      this.emit("connect");
    });

    socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    socket.onAny((event, ...args) => {
      this.emit(event, ...args);
      // console.log(event, ...args);
    });

    this.socket = socket;

    const interval = setInterval(() => {
      this.#flushOps();
    }, 50);

    socket.on("disconnect", () => {
      clearInterval(interval);
    });
  }

  #pendingOps = [] as IDocumentMessage[];

  submitOp(op: IDocumentMessage) {
    const object = op.clientMetadata?.object;
    if (object && object.squashOps) {
      for (let i = 0; i < this.#pendingOps.length; i++) {
        const pendingOp = this.#pendingOps[i];
        if (pendingOp.path === op.path) {
          const squashed = object.squashOps(pendingOp.content, op.content);
          if (squashed) {
            this.#pendingOps.splice(i, 1);
            this.#pendingOps.push({
              ...op,
              content: squashed,
            });
            return;
          }
        }
      }
    }
    this.#pendingOps.push(op);

    if (this.#pendingOps.length > 50) {
      this.#flushOps();
    }
  }

  #flushOps() {
    if (this.#pendingOps.length > 0) {
      this.#pendingOps.forEach((op) => {
        delete op.clientMetadata;
      });

      this.socket.emit("submitOp", this.#pendingOps);
      this.#pendingOps = [];
    }
  }

  disconnect() {
    this.socket.disconnect();
  }

  send(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  /**
   * @description WARNING: This will not emit to the socket, it will emit to the local event emitter
   * Use either `this.send` or `this.socket.emit` to send events to the server instead
   */
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }
}
