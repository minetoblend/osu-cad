import type { ClientSocket } from '@osucad/multiplayer';
import type { ChatMessage } from '../protocol/ChatMessage';
import { Action } from 'osucad-framework';

export class Chat {
  constructor(protected readonly socket: ClientSocket) {
    socket.on('chatMessageCreated', (message) => {
      this.messages.push(message);
      this.messageCreated.emit(message);
    });
  }

  send(content: string) {
    this.socket.emit('createChatMessage', content);
  }

  messages: ChatMessage[] = [];

  messageCreated = new Action<ChatMessage>();
}
