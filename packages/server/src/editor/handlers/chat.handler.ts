import { MessageHandler } from './message-handler';
import { OnMessage } from './decorator';
import { RoomUser } from '../room-user';
import { BeatmapAccess, ChatHistory, ChatMessage } from '@osucad/common';

export class ChatHandler extends MessageHandler {
  chatHistory: ChatHistory = {
    messages: [],
  };

  onUserJoin(roomUser: RoomUser) {
    super.onUserJoin(roomUser);
    roomUser.socket.emit('chatHistory', this.chatHistory);
  }

  @OnMessage('sendChatMessage')
  onSendChatMessage(roomUser: RoomUser, message: string): void {
    const chatMessage: ChatMessage = {
      id: this.chatHistory.messages.length,
      user: roomUser.user.getInfo(),
      message,
    };
    this.chatHistory.messages.push(chatMessage);
    this.room.broadcast('chatMessageCreated', chatMessage);
  }

  @OnMessage('deleteChatMessage')
  onDeleteChatMessage(roomUser: RoomUser, messageId: number): void {
    if (roomUser.access < BeatmapAccess.MapsetOwner) return;

    const index = this.chatHistory.messages.findIndex(
      (message) => message.id === messageId,
    );

    if (index === -1) return;

    this.chatHistory.messages.splice(index, 1);
    this.room.broadcast('chatMessageDeleted', messageId);
  }
}
