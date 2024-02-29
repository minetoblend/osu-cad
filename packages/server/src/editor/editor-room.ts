import { UserEntity } from '../users/user.entity';
import { Socket } from 'socket.io';
import {
  Beatmap,
  BeatmapAccess,
  ClientMessages,
  ControlPointManager,
  defaultHitSoundLayers,
  ServerMessages,
} from '@osucad/common';
import { Logger } from '@nestjs/common';
import { BeatmapEntity } from '../beatmap/beatmap.entity';
import { EditorRoomEntity } from './editor-room.entity';
import { RoomUser } from './room-user';
import {
  BeatmapHandler,
  ChatHandler,
  MessageHandler,
  PresenceHandler,
  UserHandler,
} from './handlers';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BeatmapPermissionsService } from '../beatmap/beatmap-permissions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeatmapMigrator } from '../beatmap/beatmap-migrator';
import { BeatmapSnapshotService } from '../beatmap/beatmap-snapshot.service';

export class EditorRoom extends EventEmitter2 {
  constructor(
    private readonly permissionsService: BeatmapPermissionsService,
    @InjectRepository(EditorRoomEntity)
    private readonly editorRoomRepository: Repository<EditorRoomEntity>,
    private readonly migrator: BeatmapMigrator,
    private readonly snapshotService: BeatmapSnapshotService,
  ) {
    super();
  }

  logger = new Logger(EditorRoom.name);
  beatmap: Beatmap;
  createdAt = Date.now();

  stateHandler = new BeatmapHandler(this);
  userHandler = new UserHandler(this);
  chatHandler = new ChatHandler(this);
  presenceHandler = new PresenceHandler(this);

  readonly handlers: MessageHandler[] = [
    this.stateHandler,
    this.userHandler,
    this.chatHandler,
    this.presenceHandler,
  ];

  roomEntity = new EditorRoomEntity();
  entity!: BeatmapEntity;

  async init(entity: BeatmapEntity) {
    this.entity = entity;

    const snapshot = await this.snapshotService.getLatestSnapshot(entity);
    if (!snapshot) {
      throw new Error('No snapshot found for beatmap');
    }

    const snapshotData = await this.migrator.migrate(snapshot.data);

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
    } = snapshotData;

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

    this.roomEntity.beatmap = entity;
    this.roomEntity.beginDate = new Date();
    this.roomEntity.endDate = new Date();
    await this.editorRoomRepository.save(this.roomEntity);
  }

  hasUnsavedChanges = false;

  private nextSessionId = 0;

  readonly users: RoomUser[] = [];

  get userCount() {
    return this.users.length;
  }

  async shutdown() {
    this.roomEntity.endDate = new Date();
    this.roomEntity.active = false;
    await this.editorRoomRepository.save(this.roomEntity);
  }

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

  @OnEvent('beatmapPermissionChange', { async: true })
  async onBeatmapAccessChanged(beatmap: BeatmapEntity, userId?: number) {
    if (this.entity.id !== beatmap.id) return;

    for (const user of this.users) {
      if (userId && user.user.id !== userId) continue;

      const access = await this.permissionsService.getAccess(
        beatmap,
        user.user.id,
      );

      this.setUserAccess(user, access);
    }
  }
}
