import type { ClientMessage } from '../protocol/ClientMessage';
import type { ServerMessage } from '../protocol/ServerMessage';
import { Action } from '@osucad/framework';

export class ClientSocket {
  readonly messageReceived = new Action<ServerMessage>();

  readonly closed = new Action<void>();

  connected: Promise<void>;

  constructor(
    endpoint: string,
    token: string,
  ) {
    const url = new URL(endpoint);
    url.searchParams.set('token', token);

    this.ws = new WebSocket(url.toString());

    this.ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data) as ServerMessage;
      this.messageReceived.emit(message);
    };

    this.ws.onclose = () => this.closed.emit();

    this.connected = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = e => reject(e);
    });
  }

  readonly ws: WebSocket;

  receive() {
    return new Promise<ServerMessage>((resolve, reject) => {
      this.messageReceived.once(resolve);
      this.closed.once(reject);
    });
  }

  send(message: ClientMessage) {
    this.ws.send(JSON.stringify(message));
  }
}
