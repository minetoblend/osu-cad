import { Injectable, Logger } from '@nestjs/common';
import { BeatmapService } from '../beatmap/beatmap.service';
import { EditorRoom } from './editor-room';
import { BeatmapData, BeatmapId } from '@osucad/common';
import { BeatmapSnapshotService } from '../beatmap/beatmap-snapshot.service';
import { BeatmapPermissionsService } from '../beatmap/beatmap-permissions.service';
import { BeatmapEntity } from '../beatmap/beatmap.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EditorRoomEntity } from './editor-room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EditorRoomService {
  private readonly rooms = new Map<
    BeatmapId,
    EditorRoom | Promise<EditorRoom>
  >();

  private readonly logger = new Logger(EditorRoomService.name);

  constructor(
    private readonly beatmapService: BeatmapService,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly permissionsService: BeatmapPermissionsService,
    @InjectRepository(EditorRoomEntity)
    private readonly editorRoomRepository: Repository<EditorRoomEntity>,
  ) {
    beatmapService.onAccessChange.addListener(({ beatmap }) =>
      this.onBeatmapAccessChanged(beatmap),
    );
    permissionsService.onPermissionChange.addListener(({ beatmap, user }) =>
      this.onBeatmapAccessChanged(beatmap, user),
    );

    setInterval(async () => {
      this.printStats();

      for (const room of this.rooms.values()) {
        if (room instanceof Promise) {
          continue;
        }

        const entity = room.entity;
        if (entity && room.hasUnsavedChanges) {
          const beatmap = room.beatmap;

          const data: BeatmapData = {
            version: 2,
            general: beatmap.general,
            audioFilename: beatmap.audioFilename,
            backgroundPath: beatmap.backgroundPath,
            colors: beatmap.colors.map(
              (color) => '#' + color.toString(16).padStart(6, '0'),
            ),
            difficulty: beatmap.difficulty,
            bookmarks: beatmap.bookmarks,
            controlPoints: beatmap.controlPoints.serializeLegacy(),
            hitObjects: beatmap.hitObjects.serialize(),
            hitSounds: beatmap.hitSounds,
          };

          await this.beatmapService.save(entity, data);
        }
      }

      for (const [key, room] of [...this.rooms.entries()]) {
        if (room instanceof Promise) continue;
        if (room.userCount === 0) {
          this.rooms.delete(key);
          await room.shutdown();
          room.roomEntity.endDate = new Date();
          room.roomEntity.active = false;
          await this.editorRoomRepository.save(room.roomEntity);
          this.logger.log(`closed room ${key}`);
        }
      }
    }, 15_000);
  }

  private async createRoom(beatmapId: BeatmapId): Promise<EditorRoom | null> {
    const beatmap = await this.beatmapService.findBeatmapByUuid(beatmapId);
    if (!beatmap) return null;
    this.logger.log(
      `creating room ${beatmapId} for ${beatmap.mapset.artist} - ${beatmap.mapset.title}`,
    );
    const snapshot = await this.snapshotService.getLatestSnapshot(beatmap);

    if (!snapshot) {
      this.logger.error(
        `Could not find snapshot for beatmap ${beatmapId}: ${beatmap.mapset.artist} - ${beatmap.mapset.title}`,
      );
      return null;
    }

    const roomEntity = new EditorRoomEntity();
    roomEntity.beatmap = beatmap;

    await this.editorRoomRepository.save(roomEntity);

    return new EditorRoom(this, roomEntity, beatmap, snapshot.data);
  }

  async getRoom(beatmapId: BeatmapId): Promise<EditorRoom | undefined> {
    const room = this.rooms.get(beatmapId);

    if (!room) return undefined;

    return room instanceof Promise ? await room : room;
  }

  async getRoomOrCreateRoom(beatmapId: BeatmapId): Promise<EditorRoom | null> {
    let room = this.rooms.get(beatmapId);

    if (!room) {
      room = this.createRoom(beatmapId).then((room) => {
        if (room) this.rooms.set(beatmapId, room);
        else this.rooms.delete(beatmapId);
        return room;
      });
      this.rooms.set(beatmapId, room);
      return room;
    }

    return room instanceof Promise ? await room : room;
  }

  printStats() {
    const rooms = [...this.rooms.values()].filter(
      (room) => !(room instanceof Promise),
    ) as EditorRoom[];
    const totalUsers = rooms.reduce((acc, room) => acc + room.userCount, 0);
    this.logger.log(`${rooms.length} active rooms with ${totalUsers} users`);
    rooms.sort((a, b) => b.userCount - a.userCount);
    for (const room of rooms) {
      const metadata = room.beatmap.metadata;
      this.logger.log(
        `  [${room.beatmap.id}] ${metadata.artist} - ${metadata.title} - ${room.userCount} users`,
      );
      for (const user of room.users) {
        this.logger.log(
          `  |   ${user.user.username} { sessionId: ${user.sessionId} }`,
        );
      }
    }
  }

  async onBeatmapAccessChanged(beatmap: BeatmapEntity, userId?: number) {
    const room = await this.getRoom(beatmap.uuid);
    if (!room) return;

    for (const user of [...room.users]) {
      if (userId && user.user.id !== userId) continue;

      const access = await this.permissionsService.getAccess(
        beatmap,
        user.user.id,
      );
      room.setUserAccess(user, access);
    }
  }

  getActiveRooms(): EditorRoom[] {
    const rooms: EditorRoom[] = [];
    for (const room of this.rooms.values()) {
      if (room instanceof Promise) continue;
      rooms.push(room);
    }
    return rooms;
  }
}
