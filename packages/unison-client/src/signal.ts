import { ISignalMessage } from "@osucad/unison";
import { EventEmitter } from "events";
import { UnisonClientConnection } from "./client";

export class SignalManager {
  private readonly emitter = new EventEmitter();

  constructor(private readonly connection: UnisonClientConnection) {
    connection.on("signal", (signal: ISignalMessage) => {
      this.emitter.emit(signal.name, signal.content, signal);
    });
  }

  on(
    name: string,
    listener: (
      content: unknown,
      message: ISignalMessage
    ) => void
  ) {
    this.emitter.on(name, listener);
  }

  off(
    name: string,
    listener: (content: unknown, message: ISignalMessage) => void
  ) {
    this.emitter.off(name, listener);
  }

  emit(name: string, content: unknown) {
    this.connection.socket.emit("submitSignal", {
      name,
      content,
    });
  }
}
