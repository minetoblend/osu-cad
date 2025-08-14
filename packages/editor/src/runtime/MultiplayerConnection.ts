import type { ServerMessages, ClientMessages } from "@osucad/multiplayer-protocol";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { EventEmitter } from "pixi.js";

export class MultiplayerConnection extends EventEmitter<ServerMessages>
{
  constructor(readonly socket: Socket<ServerMessages, ClientMessages>)
  {
    super();

    socket.onAny((type, ...args) => this.emit(type, ...args));
  }

  static async create()
  {
    const socket = io("/", { transports: ["websocket"] });

    await new Promise<void>((resolve, reject) =>
    {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });

    return new MultiplayerConnection(socket);
  }

  send<T extends keyof ClientMessages>(message: T, ...args: Parameters<ClientMessages[T]>)
  {
    this.socket.emit(message, ...args);
  }

  async next<T extends keyof ServerMessages>(message: T): Promise<Parameters<ServerMessages[T]>>
  {
    return new Promise((resolve) => this.socket.once(message as any, (...args: any[]) => resolve(args as any)));
  }
}
