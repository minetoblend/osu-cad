import { Socket } from "socket.io";
import { IWebSocket } from "./webSocket";

export class SocketIoWebsocket implements IWebSocket {
  constructor(private readonly socket: Socket) {}

  on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.socket.off(event, callback);
  }

  emit(event: string, ...args: any[]): void {
    this.socket.emit(event, ...args);
  }

  onAny(callback: (event: string, data: any) => void): void {
    this.socket.onAny(callback);
  }

  offAny(callback: (event: string, data: any) => void): void {
    this.socket.offAny(callback);
  }
}
