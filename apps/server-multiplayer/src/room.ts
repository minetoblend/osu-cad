import { TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor/runtime";
import type { IClient, ClientMessages, IConnected, IDocumentMessage, IRemoteDocumentMessage, ServerMessages } from "@osucad/multiplayer-core";
import { OsuRuleset } from "@osucad/ruleset-osu";
import type { BroadcastOperator, Server, Socket } from "socket.io";

export class Room
{
  sequenceNumber = 0;

  static async create(documentId: string, io: Server)
  {
    const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

    const timingPoint = new TimingControlPoint();
    timingPoint.bpm = 180;
    runtime.root.controlPointInfo.add(timingPoint);

    return new Room(documentId, runtime, io.to(documentId));
  }

  constructor(
    readonly documentId: string,
    readonly runtime: EditorRuntime,
    readonly broadcast: BroadcastOperator<ServerMessages, any>,
  )
  {
  }

  process(clientId: string, deltas: IDocumentMessage[])
  {
    const processed: IRemoteDocumentMessage[] = [];

    for (const message of deltas)
    {
      this.runtime.process(message, false);
      processed.push({
        ...message,
        clientId,
        sequenceNumber: ++this.sequenceNumber,
      });
    }

    this.broadcast.emit("deltas", processed);
  }

  #clients = new Map<string, IClient>();

  async accept(socket: Socket<ClientMessages, ServerMessages>): Promise<IConnected>
  {
    const clientId = crypto.randomUUID();

    const client: IClient = { clientId };

    this.#clients.set(clientId, client);

    this.broadcast.emit("clientJoin", client);

    socket.join(this.documentId);

    socket.on("deltas", deltas => this.process(clientId, deltas));

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
      summary: this.runtime.createSummary(),
      clients: [...this.#clients.values()],
    };
  }
}
