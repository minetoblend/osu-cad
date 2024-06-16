import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'pixi.js';
import { ClientMessages, ServerMessages } from '@osucad/common';

export function createSocket(joinKey: string): EditorSocket {
  const host = window.origin.replace(/^https/, 'wss');
  const socket = io(`${host}/editor`, {
    withCredentials: true,
    query: { id: joinKey },
    transports: ['websocket'],
  });
  return new EditorSocket(socket);
}

export class EditorSocket extends EventEmitter<
  ServerMessages & {
    connect: () => void;
    disconnect: () => void;
    connect_error: (err: Error) => void;
  }
> {
  constructor(readonly socket: Socket) {
    super();
    this.socket.onAny((event, ...args) => {
      this.emit(event, ...args);
    });
  }

  send<T extends ClientMessageId>(message: T, ...args: ClientMessageArgs<T>) {
    this.socket.emit(message, ...args);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

type ClientMessageId = keyof {
  [K in keyof ClientMessages]: ClientMessages[K] extends (...args: any) => void
    ? K
    : never;
};

type ClientMessageArgs<T extends ClientMessageId> = Parameters<
  ClientMessages[T]
>;
