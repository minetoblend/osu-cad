import { Injectable, Logger } from '@nestjs/common';
import { BeatmapService } from '../beatmap/beatmap.service';
import { EditorRoom } from './editor-room';
import { BeatmapId } from '@osucad/common';
import { BeatmapSnapshotService } from '../beatmap/beatmap-snapshot.service';
import { ModuleRef } from '@nestjs/core';
import { Server } from 'socket.io';

@Injectable()
export class EditorRoomService {
  private readonly rooms = new Map<
    BeatmapId,
    EditorRoom | Promise<EditorRoom | null>
  >();

  private readonly logger = new Logger(EditorRoomService.name);

  constructor(
    private readonly beatmapService: BeatmapService,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly moduleRef: ModuleRef,
  ) {
    setInterval(async () => {
      this.printStats();

      for (const room of this.rooms.values()) {
        if (room instanceof Promise) {
          continue;
        }

        const entity = room.entity;
        if (entity && room.hasUnsavedChanges) {
          const beatmap = room.beatmap;

          await this.snapshotService.createSnapshotFromBeatmap(entity, beatmap);
        }
      }

      for (const [key, room] of [...this.rooms.entries()]) {
        if (room instanceof Promise) continue;
        if (room.userCount === 0) {
          this.rooms.delete(key);
          await room.shutdown();
          this.logger.log(`closed room ${key}`);
        }
      }
    }, 15_000);
  }

  private async createRoom(
    beatmapId: BeatmapId,
    server: Server,
  ): Promise<EditorRoom | null> {
    const beatmap = await this.beatmapService.findByUuid(beatmapId);
    if (!beatmap) return null;
    this.logger.log(
      `creating room ${beatmapId} for ${beatmap.mapset.artist} - ${beatmap.mapset.title}`,
    );

    const room = await this.moduleRef.create(EditorRoom);
    await room.init(beatmap, server);

    return room;
  }

  async getRoom(beatmapId: BeatmapId): Promise<EditorRoom | null> {
    const room = this.rooms.get(beatmapId);

    if (!room) return null;

    return room instanceof Promise ? await room : room;
  }

  async getRoomOrCreateRoom(
    beatmapId: BeatmapId,
    server: Server,
  ): Promise<EditorRoom | null> {
    let room = this.rooms.get(beatmapId);

    if (!room) {
      room = this.createRoom(beatmapId, server).then((room) => {
        if (room) this.rooms.set(beatmapId, room);
        else this.rooms.delete(beatmapId);
        return room;
      });
      if (room) {
        this.rooms.set(beatmapId, room);
      }
      return room ?? null;
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

  getActiveRooms(): EditorRoom[] {
    const rooms: EditorRoom[] = [];
    for (const room of this.rooms.values()) {
      if (room instanceof Promise) continue;
      rooms.push(room);
    }
    return rooms;
  }
}
