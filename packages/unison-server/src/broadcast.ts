import { EventEmitter } from "stream";
import { IWebSocket } from "./webSocket";

export class MessageDispatcher<TProducer> {
  private broadcast = new Set<IWebSocket>();
  private clientEvents = new EventEmitter();

  connect(socket: IWebSocket, producer: TProducer) {
    this.broadcast.add(socket);

    const onMessage = (event: string, ...args: any[]) =>
      this.clientEvents.emit(event, producer, ...args);

    socket.onAny(onMessage);

    const disconnect = () => {
      this.broadcast.delete(socket);
      socket.offAny(onMessage);
    };

    socket.on("disconnect", disconnect);

    return disconnect;
  }

  emit(event: string, ...args: any[]) {
    this.broadcast.forEach((listener) => listener.emit(event, ...args));
  }

  on(event: string, callback: (producer: TProducer, ...args: any[]) => void) {
    this.clientEvents.on(event, callback);

    return () => this.clientEvents.off(event, callback);
  }

  off(event: string, callback: (producer: TProducer, ...args: any[]) => void) {
    this.clientEvents.off(event, callback);
  }

  topic(emitChannel: string, listenChannel = emitChannel): MessageTopic<TProducer> {
    return new MessageTopic(this, emitChannel, listenChannel);
  }
}

export class MessageTopic<TProducer> {
  constructor(
    private readonly topic: MessageDispatcher<TProducer>,
    private readonly emitChannel: string,
    private readonly listenChannel: string
  ) {}

  emit(...args: any[]) {
    this.topic.emit(this.emitChannel, ...args);
  }

  on(callback: (producer: TProducer, ...args: any[]) => void) {
    return this.topic.on(this.listenChannel, callback);
  }

  off(callback: (producer: TProducer, ...args: any[]) => void) {
    this.topic.off(this.listenChannel, callback);
  }
}
