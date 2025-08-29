import type { ServerMessages, ClientMessages } from "@osucad/multiplayer-protocol";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { EventEmitter } from "pixi.js";

export class MultiplayerConnection extends EventEmitter<ServerMessages>
{
  public constructor(public readonly socket: Socket<ServerMessages, ClientMessages>)
  {
    super();

    socket.on("init", (...args) => this.emit("init", ...args));
    socket.on("deltas", (...args) => this.emit("deltas", ...args));
    socket.on("signal", (...args) => this.emit("signal", ...args));
  }

  public static async create()
  {
    const socket = io("/", { transports: ["websocket"] });

    await new Promise<void>((resolve, reject) =>
    {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });

    return new MultiplayerConnection(socket);
  }

  public send<T extends keyof ClientMessages>(message: T, ...args: Parameters<ClientMessages[T]>)
  {
    this.socket.emit(message, ...args);
  }

  public async next<T extends keyof ServerMessages>(message: T): Promise<Parameters<ServerMessages[T]>>
  {
    return new Promise((resolve) => this.socket.once(message as any, (...args: any[]) => resolve(args as any)));
  }
}
