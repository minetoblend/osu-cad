import type { ClientMessages, IClient, IConnect, IConnected, IDocumentMessage, IRemoteDocumentMessage, IRemoteSignalMessage, ISignalMessage, ServerMessages } from "@osucad/multiplayer-protocol";
import { EventEmitter } from "eventemitter3";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export interface DeltaConnectionEvents
{
  deltas(deltas: IRemoteDocumentMessage[]): void;
  signal(message: IRemoteSignalMessage): void;
  clientJoin(client: IClient): void
  clientLeave(client: IClient): void
}

export class DeltaConnection extends EventEmitter<DeltaConnectionEvents>
{
  public constructor(
    public readonly documentId: string,
    public readonly socket: Socket<ServerMessages, ClientMessages>,
  )
  {
    super();

    socket.on("deltas", deltas => this.emit("deltas", deltas));
    socket.on("signal", signal => this.emit("signal", signal));
    socket.on("clientJoin", client => this.emit("clientJoin", client));
    socket.on("clientLeave", client => this.emit("clientLeave", client));
  }

  public readonly initialDeltas: IRemoteDocumentMessage[] = [];

  public static async create(documentId: string, timeout: number = 20000)
  {
    const socket = io("http://localhost:3000", {
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

  public get clientId()
  {
    return this.details.clientId;
  }

  public get clients()
  {
    return this.details.clients;
  }

  public get sequenceNumber()
  {
    return this.details.sequenceNumber;
  }

  public async connect(connectMessage: IConnect)
  {
    const onDeltas = (deltas: IRemoteDocumentMessage[]) => this.initialDeltas.push(...deltas);

    this.socket.on("deltas", onDeltas);

    this.#details = await this.socket.emitWithAck("connectDocument", connectMessage);

    this.socket.off("deltas", onDeltas);
  }

  public submitDeltas(deltas: IDocumentMessage[])
  {
    this.socket.emit("deltas", deltas);
  }

  public submitSignal(signal: ISignalMessage)
  {
    this.socket.emit("signal", signal);
  }
}
