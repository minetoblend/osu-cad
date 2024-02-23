import { UserEntity } from '../users/user.entity';
import { Socket } from 'socket.io';
import {
  Beatmap,
  ClientMessages,
  CommandContext,
  ControlPointManager,
  decodeCommands,
  defaultHitSoundLayers,
  encodeCommands,
  getCommandHandler,
  Presence,
  ServerMessages,
  Slider,
  UserSessionInfo,
  VersionedEditorCommand,
} from '@osucad/common';
import { Logger } from '@nestjs/common';
import { BeatmapEntity } from '../beatmap/beatmap.entity';
import { EditorSessionEntity } from './editor-session.entity';

export class EditorRoom {
  private readonly logger: Logger;

  readonly beatmap: Beatmap;

  hasUnsavedChanges = false;

  constructor(public entity: BeatmapEntity) {
    const {
      hitObjects,
      controlPoints,
      difficulty,
      bookmarks,
      backgroundPath,
      colors,
      audioFilename,
      general,
      hitSounds = { layers: defaultHitSoundLayers() },
      version,
    } = entity.data;

    this.beatmap = new Beatmap({
      id: entity.uuid,
      setId: entity.mapset.id,
      metadata: {
        artist: entity.mapset.artist,
        title: entity.mapset.title,
        tags: entity.mapset.tags.join(' '),
      },
      name: entity.name,
      hitObjects,
      controlPoints: ControlPointManager.fromLegacy(controlPoints).serialize(),
      difficulty,
      bookmarks,
      backgroundPath,
      colors,
      audioFilename,
      general,
      hitSounds,
    });

    if (version < 2) {
      for (const hitObject of this.beatmap.hitObjects.hitObjects) {
        if (
          hitObject instanceof Slider &&
          hitObject.velocityOverride !== null
        ) {
          hitObject.velocityOverride /= hitObject.baseVelocity;
        }
      }
    }

    this.logger = new Logger(`${EditorRoom.name}:${this.beatmap.id}`);
  }

  private nextSessionId = 0;

  readonly users: RoomUser[] = [];

  get userCount() {
    return this.users.length;
  }

  async shutdown() {}

  accept(
    client: Socket<ClientMessages, ServerMessages>,
    user: UserEntity,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    access: EditorSessionEntity,
  ) {
    const roomUser = new RoomUser(user, client, this.nextSessionId++, this);

    this.logger.log(
      `User ${user.username} joined { sessionId: ${roomUser.sessionId} }`,
    );

    roomUser.send('roomState', {
      users: this.users.map((user) => user.getInfo()),
      beatmap: this.beatmap.serialize(),
      chat: { messages: [] },
      ownUser: roomUser.getInfo(),
    });

    this.users.push(roomUser);
    this.broadcast('userJoined', roomUser.getInfo());

    client.on('disconnect', () => this.handleDisconnect(roomUser));

    client.on('commands', (commands) => {
      this.handleCommands(roomUser, decodeCommands(commands));
    });
    client.on('setPresence', (presence) => {
      roomUser.presence = presence;
      this.broadcast('userActivity', roomUser.sessionId, presence.activity);
    });
    client.on('roll', () => {
      this.broadcast('roll', roomUser.getInfo());
    });
  }

  private handleDisconnect(user: RoomUser) {
    this.logger.log(
      `User ${user.user.username} left { sessionId: ${user.sessionId} }`,
    );
    const index = this.users.indexOf(user);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.broadcast('userLeft', user.getInfo(), 'disconnected');
    }
  }

  broadcast<T extends keyof ServerMessages>(
    message: T,
    ...parameters: Parameters<ServerMessages[T]>
  ) {
    this.users.forEach((user) => user.send(message, ...parameters));
  }

  handleKick(kickedBy: RoomUser, userId: number, reason: string, ban: boolean) {
    console.log('kick', userId, reason, ban);
    const users = this.users.filter((u) => u.user.id === userId);
    for (const targetUser of users) {
      targetUser.send('kicked', reason, ban);
      this.broadcast(
        'userLeft',
        targetUser.getInfo(),
        ban ? 'banned' : 'kicked',
      );
      targetUser.socket.disconnect();
    }
  }

  private handleCommands(
    roomUser: RoomUser,
    commands: VersionedEditorCommand[],
  ) {
    this.hasUnsavedChanges = true;
    for (const command of commands) {
      const context = new CommandContext(
        this.beatmap,
        false,
        false,
        command.version,
      );
      const handler = getCommandHandler(command.command);
      if (handler) {
        handler.apply(command.command, context);
      }
    }
    this.broadcast('commands', encodeCommands(commands), roomUser.sessionId);
  }
}

class RoomUser {
  constructor(
    readonly user: UserEntity,
    readonly socket: Socket<ClientMessages, ServerMessages>,
    readonly sessionId: number,
    readonly room: EditorRoom,
  ) {
    socket.on('kickUser', (id: number, reason: string, ban: boolean) =>
      room.handleKick(this, id, reason, ban),
    );
  }

  presence: Presence = {
    activity: null,
    activeBeatmap: null,
  };

  getInfo(): UserSessionInfo {
    return {
      sessionId: this.sessionId,
      id: this.user.id,
      presence: this.presence,
      role: 'admin',
      username: this.user.username,
      avatarUrl: this.user.avatarUrl,
    };
  }

  send<T extends keyof ServerMessages>(
    message: T,
    ...parameters: Parameters<ServerMessages[T]>
  ) {
    this.socket.emit(message, ...parameters);
  }
}
