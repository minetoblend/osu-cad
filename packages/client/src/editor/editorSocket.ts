import { Socket } from 'socket.io-client';
import { ClientMessages, ServerMessages } from '@osucad/common';
import CompressionWorker from './compressionWorker.ts?worker';
import DecompressionWorker from './decompressionWorker.ts?worker';
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
    this.socket.on('connect', () => this.emit('connect'));
    this.socket.on('disconnect', () => this.emit('disconnect'));
    this.socket.on('connect_error', (err) => this.emit('connect_error', err));
    this.socket.on('msg', (message, data) => {
      this.decompressionWorker.postMessage([message, data]);
    });
    this.compressionWorker.onmessage = (e) => {
      const [message, data] = e.data;
      this.socket.emit('msg', message, data);
    };
    this.decompressionWorker.onmessage = (e) => {
      const [message, data] = e.data;
      this.emit(message, ...data);
    };
  }

  private compressionWorker = new CompressionWorker();
  private decompressionWorker = new DecompressionWorker();

  send<T extends ClientMessageId>(message: T, ...args: ClientMessageArgs<T>) {
    this.compressionWorker.postMessage([message, args]);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
