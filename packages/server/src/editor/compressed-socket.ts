import { Socket } from 'socket.io';
import {
  ClientMessages,
  ServerMessages,
  compressMessage,
  decompressMessage,
} from '@osucad/common';
import { EventEmitter } from 'eventemitter3';

type ClientMessageId = keyof ClientMessages;

type ClientMessageArgs<T extends ClientMessageId> = Parameters<
  ClientMessages[T]
>;

type ServerMessageId = keyof ServerMessages;

type ServerMessageArgs<T extends ServerMessageId> = Parameters<
  ServerMessages[T]
>;

export class CompressedSocket extends EventEmitter<
  ClientMessages & {
    connect: () => void;
    disconnect: () => void;
    connect_error: (err: Error) => void;
  }
> {
  constructor(readonly socket: Socket) {
    super();
    this.socket.on('connect', () => this.emit('connect'));
    this.socket.on('disconnect', () => this.emit('disconnect'));
    this.socket.on('connect_error', (err) => this.emit('connect_error', err));
    this.socket.on('msg', (message, data) => {
      try {
        if (!(data instanceof Uint8Array)) throw new Error('Invalid data type');
        const args = decompressMessage(data as Uint8Array);
        this.emit(message, ...(args as ClientMessageArgs<typeof message>));
      } catch (e) {
        console.error('Failed to decompress message', e);
      }
    });
  }

  send<T extends ServerMessageId>(message: T, ...args: ServerMessageArgs<T>) {
    this.sendRaw(message, compressMessage(args));
  }

  sendRaw(message: string, data: Uint8Array) {
    this.socket.emit('msg', message, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
