import { MessageHandler } from './message-handler';
import { OnMessage } from './decorator';
import { RoomUser } from '../room-user';
import {
  BeatmapAccess,
  ChatFragment,
  ChatHistory,
  ChatMessage,
} from '@osucad/common';

const timestampRegex =
  /(?<minutes>-?\d{2}):(?<seconds>-?\d{2}):(?<millis>-?\d{3})(?: \((?<combo>\d+(?:,\d+)*)\))?/gm;

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
    if (message.length > 500) return;

    if (message.startsWith('!')) {
      this.handleCommand(roomUser, message);
      return;
    }

    const chatMessage: ChatMessage = {
      id: this.chatHistory.messages.length,
      user: roomUser.user.getInfo(),
      message: this.parseMessage(message),
      timestamp: Date.now(),
    };
    this.chatHistory.messages.push(chatMessage);
    this.room.broadcast('chatMessageCreated', chatMessage);
  }

  private parseMessage(message: string): ChatFragment[] {
    const fragments: ChatFragment[] = [];
    let currentFragment = '';

    const timestampMatches = [...message.matchAll(timestampRegex)];

    for (let i = 0; i < message.length; i++) {
      if (timestampMatches[0]?.index === i) {
        const match = timestampMatches.shift()!;
        const minutes = parseInt(match.groups!.minutes);
        const seconds = parseInt(match.groups!.seconds);
        const millis = parseInt(match.groups!.millis);
        const time = minutes * 60000 + seconds * 1000 + millis;
        const objects = match.groups!.combo
          ? match.groups!.combo.split(',').map((it) => parseInt(it))
          : [];
        fragments.push({
          text: currentFragment,
        });
        currentFragment = '';
        fragments.push({
          text: match[0],
          type: 'timestamp',
          time,
          objects,
        });
        i += match[0].length - 1;
        continue;
      }
      if (message[i] === '@') {
        let found = false;
        for (const user of this.room.users) {
          const username = user.user.username.toLowerCase();
          const nextWord = message.substring(i + 1, i + 1 + username.length);
          const charAfter = message[i + 1 + username.length];
          if (
            nextWord.toLowerCase() === username &&
            (charAfter === undefined || charAfter === ' ' || charAfter === '\n')
          ) {
            if (currentFragment.length > 0) {
              fragments.push({ text: currentFragment });
              currentFragment = '';
            }
            fragments.push({
              text: `@${user.user.username}`,
              type: 'mention',
              mention: user.user.id,
            });
            i += username.length;
            found = true;
            break;
          }
        }
        if (!found) {
          currentFragment += message[i];
        }
      } else {
        currentFragment += message[i];
      }
    }
    if (currentFragment.length > 0) {
      fragments.push({ text: currentFragment });
    }
    return fragments;
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

  private handleCommand(roomUser: RoomUser, message: string) {
    const [command, ...args] = message.substring(1).split(' ');
    switch (command) {
      case 'help':
        this.sendHelp(roomUser);
        break;
      case 'purge':
        this.purgeChat(roomUser, args);
        break;
      case 'roll':
        this.roll(roomUser, args);
        break;
      case 'kick':
        this.kickUser(roomUser, args);
        break;
      case 'whisper':
        this.whisper(roomUser, args);
        break;
    }
  }

  private sendHelp(roomUser: RoomUser) {
    roomUser.socket.emit('chatMessageCreated', {
      id: this.chatHistory.messages.length,
      user: 'server',
      message: helpText,
      timestamp: Date.now(),
    });
  }

  private purgeChat(user: RoomUser, args: string[]) {
    if (user.access < BeatmapAccess.MapsetOwner) return;
    if (args.length !== 1) return;
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1) return;

    const deleted = this.chatHistory.messages.slice(-amount);
    for (const message of deleted) {
      this.room.broadcast('chatMessageDeleted', message.id);
    }
    this.chatHistory.messages = this.chatHistory.messages.slice(
      0,
      this.chatHistory.messages.length - amount,
    );
  }

  private roll(user: RoomUser, args: string[]) {
    if (args.length > 1) return;
    const sides = parseInt(args[0] ?? '100');
    if (isNaN(sides) || sides < 1) return;

    const result = Math.floor(Math.random() * sides) + 1;

    const message: ChatMessage = {
      id: this.chatHistory.messages.length,
      user: 'server',
      timestamp: Date.now(),
      message: [
        {
          text: `@${user.username}`,
          type: 'mention',
          mention: user.user.id,
        },
        {
          text: ` rolls ${result} ${result === 1 ? 'point' : 'points'}`,
        },
      ],
    };

    this.chatHistory.messages.push(message);
    user.socket.emit('chatMessageCreated', message);
  }

  private kickUser(roomUser: RoomUser, args: string[]) {
    if (roomUser.access < BeatmapAccess.MapsetOwner) return;
    if (args.length !== 1) return;
    const username = args[0].toLowerCase();
    const user = this.room.users.find(
      (u) => u.user.username.toLowerCase() === username,
    );
    if (user) {
      this.room.userHandler.kick(user.user.id);
    }
  }

  private whisper(roomUser: RoomUser, args: string[]) {
    if (args.length < 2) return;
    const username = args[0].toLowerCase();
    const users = this.room.users.filter(
      (u) => u.user.username.toLowerCase() === username,
    );
    const message = args.slice(1).join(' ');

    for (const user of users) {
      user.socket.emit('chatMessageCreated', {
        id: this.chatHistory.messages.length,
        timestamp: Date.now(),
        user: {
          ...roomUser.user.getInfo(),
          username: roomUser.username + ' whispers to you:',
        },
        message: this.parseMessage(message),
      });
    }
    if (users.length > 0) {
      roomUser.socket.emit('chatMessageCreated', {
        id: this.chatHistory.messages.length,
        timestamp: Date.now(),
        user: {
          ...roomUser.user.getInfo(),
          username: roomUser.username + ` whispers to ${users[0].username}:`,
        },
        message: this.parseMessage(message),
      });
    }
  }
}

const helpText: ChatFragment[] = [
  { text: 'Available commands:' },
  { type: 'newline' },
  { text: '!help', type: 'code' },
  { text: '  shows this message' },
  { type: 'newline' },
  { text: '!whisper [username] [message]', type: 'code' },
  { type: 'newline' },
  { text: '  sends a private message to the user' },
  { type: 'newline' },
  { text: '!purge [amount]', type: 'code' },
  { type: 'newline' },
  { text: '  deletes the last [amount] messages' },
  { type: 'newline' },
  { text: '!roll [sides]', type: 'code' },
  { type: 'newline' },
  { text: '  rolls a dice with [sides] sides' },
  { type: 'newline' },
  { text: '!kick [username]', type: 'code' },
  { type: 'newline' },
  { text: '  kicks the user from the room' },
];
