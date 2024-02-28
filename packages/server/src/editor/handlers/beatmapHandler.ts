import { RoomUser } from '../room-user';
import { MessageHandler } from './message-handler';
import {
  BeatmapAccess,
  CommandContext,
  decodeCommands,
  encodeCommands,
  getCommandHandler,
} from '@osucad/common';
import { OnMessage } from './decorator';

export class BeatmapHandler extends MessageHandler {
  onUserJoin(roomUser: RoomUser) {
    super.onUserJoin(roomUser);
    roomUser.send('beatmap', this.room.beatmap.serialize());
  }

  readonly reusableContext = new CommandContext(
    this.room.beatmap,
    false,
    false,
    0,
  );

  @OnMessage('commands')
  onCommands(roomUser: RoomUser, commands: Uint8Array): void {
    if (roomUser.access < BeatmapAccess.Edit) {
      this.logger.error(
        `User ${roomUser.user.username} tried to send commands without edit access`,
      );
      return;
    }

    const decodedCommands = decodeCommands(commands);
    this.room.hasUnsavedChanges = true;
    for (const command of decodedCommands) {
      this.reusableContext.version = command.version;
      const handler = getCommandHandler(command.command);
      if (handler) {
        this.room.emit('beforeCommand', command.command, this.reusableContext);
        handler.apply(command.command, this.reusableContext);
        this.room.emit('afterCommand', command.command, this.reusableContext);
      }
    }
    this.room.broadcast(
      'commands',
      encodeCommands(decodedCommands),
      roomUser.sessionId,
    );
  }
}
