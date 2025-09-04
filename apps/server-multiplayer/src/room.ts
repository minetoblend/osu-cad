import type { ClientMessages, IClient, IConnected, IDocumentMessage, IRemoteDocumentMessage, ServerMessages } from "@osucad/multiplayer-core";
import type { BroadcastOperator, Server, Socket } from "socket.io";
import type { IDeltaStorage } from "./services/deltas.js";
import { queue } from "async";

export class Room
{
  public sequenceNumber = 0;

  private readonly queue = queue(async ({ clientId, deltas }: { clientId: string, deltas: IDocumentMessage[] }) =>
    await this.process(clientId, deltas),
  );

  public static async create(documentId: string, io: Server, deltaStore: IDeltaStorage)
  {
    return new Room(documentId, io.to(documentId), deltaStore);
  }

  public constructor(
    public readonly documentId: string,
    public readonly broadcast: BroadcastOperator<ServerMessages, any>,
    private readonly deltaStore: IDeltaStorage,
  )
  {
  }

  public async process(clientId: string, deltas: IDocumentMessage[])
  {
    const processed: IRemoteDocumentMessage[] = [];

    for (const message of deltas)
    {
      processed.push({
        ...message,
        clientId,
        sequenceNumber: ++this.sequenceNumber,
      });
    }

    await this.deltaStore.append(this.documentId, processed);

    this.broadcast.emit("deltas", processed);
  }

  #clients = new Map<string, IClient>();

  public async accept(socket: Socket<ClientMessages, ServerMessages>): Promise<IConnected>
  {
    const clientId = crypto.randomUUID();

    const client: IClient = { clientId };

    this.#clients.set(clientId, client);

    this.broadcast.emit("clientJoin", client);

    socket.join(this.documentId);

    socket.on("deltas", deltas => this.queue.push({ clientId, deltas }));

    socket.on("signal", (signal) => this.broadcast.emit("signal", { ...signal, clientId }));

    socket.on("disconnect", () =>
    {
      this.#clients.delete(clientId);
      this.broadcast.emit("clientLeave", client);
    });

    return {
      documentId: this.documentId,
      clientId,
      sequenceNumber: this.sequenceNumber,
      clients: [...this.#clients.values()],
    };
  }
}
