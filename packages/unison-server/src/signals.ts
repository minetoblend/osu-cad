import { MessageTopic } from "./broadcast";
import { ISignalMessage, ISignalRequest } from "@osucad/unison";
import { IClient } from "@osucad/unison";

export class SignalHandler {
  constructor(private topic: MessageTopic<IClient>) {
    topic.on((sender, signal) => this.onSignalRequest(sender, signal));
  }

  onSignalRequest(sender: IClient, request: ISignalRequest) {
    const signal: ISignalMessage = {
      clientId: sender.clientId,
    
      name: request.name,
      content: request.content,
      timestamp: Date.now(),
    };

    this.topic.emit(signal);
  }
}
