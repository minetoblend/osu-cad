import type { IDeltaConnection, IDeltaConnectionEvents } from "@osucad/multiplayer-client-definitions";
import { EventEmitter } from "eventemitter3";
import { Socket } from "socket.io-client";
import type { ClientMessages, IDeltaMessage, IDocumentInitMessage, ISequencedDeltaMessage, ISignalMessage, ServerMessages } from "@osucad/multiplayer-protocol";
import DisconnectReason = Socket.DisconnectReason;

export class DeltaConnection extends EventEmitter<IDeltaConnectionEvents> implements IDeltaConnection
{
  constructor(
    readonly documentId: string,
    readonly clientId: string,
    readonly socket: Socket<ServerMessages, ClientMessages>,
  )
  {
    super();

    socket.on("disconnect", this.#onDisconnect);
    socket.on("delta", this.#onDelta);
    socket.on("signal", this.#onSignal);

    this.initMessage = socket.emitWithAck("connectDocument", documentId);
  }

  initMessage: Promise<IDocumentInitMessage>;

  #onDisconnect = (reason: DisconnectReason) => this.emit("disconnect", reason);

  #onDelta = (documentId: string, message: ISequencedDeltaMessage[]) =>
  {
    if (documentId === this.documentId)
      this.emit("delta", documentId, message);
  };

  #onSignal = (documentId: string, message: ISignalMessage) =>
  {
    if (documentId === this.documentId)
      this.emit("signal", documentId, message);
  };

  submit(deltas: IDeltaMessage[]): void
  {
    this.socket.emit("delta", this.documentId, deltas);
  }

  submitSignal(content: string, targetClientId?: string): void
  {
    this.socket.emit("signal", this.documentId, content, targetClientId);
  }

  dispose(): void
  {
    this.socket.off("disconnect", this.#onDisconnect);
    this.socket.off("delta", this.#onDelta);
    this.socket.off("signal", this.#onSignal);
  }
}
