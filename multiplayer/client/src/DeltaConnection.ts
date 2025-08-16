import type { ClientMessages, IConnect, IConnected, IDocumentMessage, IRemoteDocumentMessage, ServerMessages } from "@osucad/multiplayer-protocol";
import { EventEmitter } from "eventemitter3";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export interface DeltaConnectionEvents
{
  deltas(deltas: IRemoteDocumentMessage[]): void;
}

export class DeltaConnection extends EventEmitter<DeltaConnectionEvents>
{
  constructor(
    readonly documentId: string,
    readonly socket: Socket<ServerMessages, ClientMessages>,
  )
  {
    super();

    socket.on("deltas", deltas => this.emit("deltas", deltas));
  }

  static async create(documentId: string, timeout: number = 20000)
  {
    const socket = io("/", {
      transports: ["websocket"],
      reconnection: false,
      timeout,
      ackTimeout: 2000,
    });

    const connection = new DeltaConnection(documentId, socket);

    await connection.connect({ documentId });

    return connection;
  }

  #details?: IConnected;

  protected get details()
  {
    if (!this.#details)
      throw new Error("not connected");

    return this.#details;
  }

  get clientId()
  {
    return this.details.clientId;
  }

  get summary()
  {
    return this.details.summary;
  }

  get sequenceNumber()
  {
    return this.details.sequenceNumber;
  }

  async connect(connectMessage: IConnect)
  {
    this.#details = await this.socket.emitWithAck("connectDocument", connectMessage);
  }

  submitDeltas(deltas: IDocumentMessage[])
  {
    this.socket.emit("deltas", deltas);
  }
}
