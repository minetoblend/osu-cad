import ConnectorWorker from './connector.worker.ts?worker'
import {EventEmitter} from "pixi.js";
import {ManagerOptions} from "socket.io-client/build/esm/manager";
import {SocketOptions} from "socket.io-client/build/esm/socket";

export class Connector extends EventEmitter {
  private worker = new ConnectorWorker();

  constructor(url: string, options: Partial<ManagerOptions & SocketOptions>) {
    super();
    this.worker.addEventListener('message', this.onMessage.bind(this));
    this.worker.postMessage({url, options})
  }

  private onMessage(event: MessageEvent) {
    this.emit(event.data.type, ...(event.data.payload ?? []));
  }

  send(message: string, ...payload: any[]) {
    this.worker.postMessage({type: message, payload});
  }
}