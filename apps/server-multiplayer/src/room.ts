import { TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor";
import type { ClientMessages, IDocumentMessage, IRemoteDocumentMessage, ServerMessages } from "@osucad/multiplayer-core";
import { OsuRuleset } from "@osucad/ruleset-osu";
import type { BroadcastOperator, Server, Socket } from "socket.io";

export class Room
{
  static async create(io: Server)
  {
    const documentId = crypto.randomUUID();

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
      });
    }

    this.broadcast.emit("deltas", processed);
  }

  accept(socket: Socket<ClientMessages, ServerMessages>)
  {
    const clientId = crypto.randomUUID();

    socket.emit("init", { clientId, summary: this.runtime.createSummary() });

    socket.join(this.documentId);

    socket.on("deltas", deltas => this.process(clientId, deltas));
  }
}
