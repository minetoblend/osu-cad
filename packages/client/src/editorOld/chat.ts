import { ChatMessage } from '@osucad/common';
import { EditorSocket } from '@/editorOld/editorSocket.ts';

export class ChatManager {
  constructor(private readonly socket: EditorSocket) {
    socket.on('chatHistory', (history) => {
      this._messages.value = history.messages;
    });

    socket.on('chatMessageCreated', (message) => {
      this.onMessageCreated(message);
    });

    socket.on('chatMessageDeleted', (messageId) => {
      this.onMessageDeleted(messageId);
    });
  }

  private _messages = ref<ChatMessage[]>([]);

  get messages() {
    return this._messages.value;
  }

  private onMessageCreated(message: ChatMessage) {
    this._messages.value.push(message);
  }

  private onMessageDeleted(messageId: number) {
    const index = this._messages.value.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      this._messages.value.splice(index, 1);
    }
  }

  sendMessage(content: string) {
    this.socket.send('sendChatMessage', content);
  }
}
