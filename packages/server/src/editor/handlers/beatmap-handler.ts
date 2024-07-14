import { RoomUser } from '../room-user';
import { MessageHandler } from './message-handler';
import {
  BeatmapAccess,
  CommandContext,
  getCommandHandler,
  IEditorCommand,
} from '@osucad/common';
import { OnMessage } from './decorator';

export class BeatmapHandler extends MessageHandler {
  onUserJoin(roomUser: RoomUser) {
    super.onUserJoin(roomUser);
    roomUser.send('beatmap', this.room.beatmap.serialize());
  }

  private context?: CommandContext;

  @OnMessage('commands')
  onCommands(roomUser: RoomUser, commands: IEditorCommand[]): void {
    if (roomUser.access < BeatmapAccess.Edit) {
      this.logger.error(
        `User ${roomUser.user.username} tried to send commands without edit access`,
      );
      return;
    }

    this.room.hasUnsavedChanges = true;

    this.context ??= new CommandContext(this.room.beatmap, true);

    for (const command of commands) {
      const handler = getCommandHandler(command);
      if (handler) {
        this.room.emit('beforeCommand', command, this.context);
        handler.apply(this.context, command, 'local');
        this.room.emit('afterCommand', command, this.context);
      }
    }
    this.room.broadcast('commands', commands, roomUser.sessionId);
  }
}
