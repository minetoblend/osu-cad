import { RoomUser } from '../room-user';
import { MessageHandler } from './message-handler';
import {
  BeatmapAccess,
  CommandContext,
  decodeCommands,
  encodeCommands,
  getCommandHandler,
} from '@osucad/common';
import { Decorator } from './decorator';

export class BeatmapHandler extends MessageHandler {
  onUserJoin(roomUser: RoomUser) {
    super.onUserJoin(roomUser);
    roomUser.send('beatmap', this.room.beatmap.serialize());
  }

  @Decorator('commands')
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
      const context = new CommandContext(
        this.room.beatmap,
        false,
        false,
        command.version,
      );
      const handler = getCommandHandler(command.command);
      if (handler) {
        handler.apply(command.command, context);
      }
    }
    this.room.broadcast(
      'commands',
      encodeCommands(decodedCommands),
      roomUser.sessionId,
    );
  }
}
