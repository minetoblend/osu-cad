import { Socket } from 'socket.io-client';
import { ClientMessages, ServerMessages } from '@osucad/common';
import { EventEmitter } from 'pixi.js';

type ClientMessageId = keyof {
  [K in keyof ClientMessages]: ClientMessages[K] extends (...args: any) => void
    ? K
    : never;
};

type ClientMessageArgs<T extends ClientMessageId> = Parameters<
  ClientMessages[T]
>;

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
