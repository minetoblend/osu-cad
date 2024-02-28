import { UserEntity } from '../users/user.entity';
import { Socket } from 'socket.io';
import {
  Beatmap,
  BeatmapAccess,
  BeatmapData,
  ClientMessages,
  ControlPointManager,
  defaultHitSoundLayers,
  ServerMessages,
  Slider,
} from '@osucad/common';
import { Logger } from '@nestjs/common';
import { BeatmapEntity } from '../beatmap/beatmap.entity';
import { EditorRoomService } from './editor-room.service';
import { EditorRoomEntity } from './editor-room.entity';
import { RoomUser } from './room-user';
import {
  BeatmapHandler,
  UserHandler,
  MessageHandler,
  PresenceHandler,
  ChatHandler,
} from './handlers';

export class EditorRoom {
  private readonly logger: Logger;

  readonly beatmap: Beatmap;

  readonly createdAt = Date.now();

  stateHandler = new BeatmapHandler(this);
  userHandler = new UserHandler(this);
  chatHandler = new ChatHandler(this);
  presenceHandler = new PresenceHandler(this);

  readonly handlers: MessageHandler[] = [
    new BeatmapHandler(this),
    new PresenceHandler(this),
    new UserHandler(this),
    new ChatHandler(this),
  ];

  constructor(
    private readonly service: EditorRoomService,
    public readonly roomEntity: EditorRoomEntity,
    public readonly entity: BeatmapEntity,
    snapshot: BeatmapData,
  ) {
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
    } = snapshot;

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

  hasUnsavedChanges = false;

  private nextSessionId = 0;

  readonly users: RoomUser[] = [];

  get userCount() {
    return this.users.length;
  }

  async shutdown() {}

  accept(
    client: Socket<ClientMessages, ServerMessages>,
    user: UserEntity,
    access: BeatmapAccess,
  ) {
    const roomUser = new RoomUser(
      user,
      client,
      this.nextSessionId++,
      this,
      access,
    );

    for (const handler of this.handlers) {
      handler.onUserJoin(roomUser);
    }

    this.users.push(roomUser);

    for (const handler of this.handlers) {
      handler.afterUserJoin(roomUser);
    }

    client.on('disconnect', () => this.handleDisconnect(roomUser));
  }

  broadcast<T extends keyof ServerMessages>(
    message: T,
    ...parameters: Parameters<ServerMessages[T]>
  ) {
    for (const user of this.users) {
      user.send(message, ...parameters);
    }
  }

  private handleDisconnect(user: RoomUser) {
    const index = this.users.indexOf(user);
    if (index !== -1) {
      for (const handler of this.handlers) {
        handler.onUserLeave(user);
      }

      this.users.splice(index, 1);
    }
  }

  setUserAccess(user: RoomUser, access: BeatmapAccess) {
    if (user.access === access) return;

    if (access <= BeatmapAccess.None) {
      this.userHandler.kick(user.sessionId);
    }

    user.access = access;

    user.send('accessChanged', access);
  }
}
