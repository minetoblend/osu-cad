import type { PlaceClient } from '../PlaceClient';
import { Action } from '@osucad/framework';

export interface IChatMessage {
  content: string;
  uid: string;
  timestamp: number;
  user: {
    id: number;
    username: string;
  };
}

export class ChatManager {
  constructor(readonly client: PlaceClient) {
    client.eventSource.addEventListener('chat', evt =>
      this.#onChatMessage(JSON.parse(evt.data)));
  }

  readonly messages: IChatMessage[] = [];

  chatMessageAdded = new Action<IChatMessage>();
  chatMessageRemoved = new Action<IChatMessage>();

  #onChatMessage(message: IChatMessage) {
    if (this.messages.some(it => it.uid === message.uid))
      return;

    this.messages.push(message);
    this.chatMessageAdded.emit(message);
  }

  async sendMessage(text: string) {
    const user = this.client.user.value;
    if (!user)
      return false;

    const message: IChatMessage = {
      content: text,
      uid: crypto.randomUUID(),
      timestamp: Date.now(),
      user,
    };

    this.#onChatMessage(message);

    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message.content,
        uid: message.uid,
      }),
    });

    if (!response.ok) {
      const index = this.messages.indexOf(message);
      if (index >= 0)
        this.messages.splice(index, 1);

      this.chatMessageRemoved.emit(message);

      return false;
    }

    return true;
  }
}
