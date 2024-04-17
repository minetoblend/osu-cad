import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Request } from 'express';
import { EditorRoomService } from './editor-room.service';
import { BeatmapPermissionsService } from '../beatmap/beatmap-permissions.service';
import { BeatmapService } from '../beatmap/beatmap.service';
import { BeatmapAccess } from '@osucad/common';
import { UserService } from '../users/user.service';
import { EditorSessionEntity } from './editor-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';

@WebSocketGateway({ namespace: 'editor', transports: ['websocket'] })
export class EditorGateway implements OnGatewayConnection {
  constructor(
    private readonly editorRoomManager: EditorRoomService,
    private readonly beatmapService: BeatmapService,
    private readonly permissionService: BeatmapPermissionsService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
    @InjectRepository(EditorSessionEntity)
    private readonly sessionRepository: Repository<EditorSessionEntity>,
  ) {}

  @WebSocketServer()
  private server: Server;

  async handleConnection(client: Socket) {
    const request = client.request as unknown as Request;

    if (!request.session.user) {
      client.disconnect();
      return;
    }

    const user = await this.userService.findById(request.session.user.id);

    if (!user) {
      client.disconnect();
      return;
    }

    const beatmapId = client.handshake.query['id'] as string;
    if (!beatmapId) {
      client.disconnect();
      return;
    }

    const beatmap = await this.beatmapService.findByShareId(beatmapId);

    if (!beatmap) {
      client.disconnect();
      return;
    }

    try {
      const access = await this.permissionService.getAccess(beatmap, user.id);

      if (access <= BeatmapAccess.None) {
        client.disconnect();
        return;
      }

      const room = await this.editorRoomManager.getRoomOrCreateRoom(
        beatmap.uuid,
        this.server,
      );

      if (!room) {
        client.disconnect();
        console.log('client requested unknown beatmap ' + beatmapId);
        return;
      }

      const session = new EditorSessionEntity();
      session.user = user;
      session.room = room.roomEntity;
      session.beatmap = room.entity;
      session.beginDate = new Date();
      session.endDate = new Date();

      await this.sessionRepository.save(session);
      await this.beatmapService.markAccessed(beatmap, user);

      await this.auditService.record(user, 'room.join', {
        beatmapId: beatmap.uuid,
        mapsetId: beatmap.mapset.id,
        title: `${beatmap.mapset.artist} - ${beatmap.mapset.title} [${beatmap.name}]`,
        access,
      });

      room.accept(client, user, access);

      client.on('disconnect', async () => {
        session.endDate = new Date();
        session.duration =
          session.endDate.getTime() - session.beginDate.getTime();
        await this.sessionRepository.save(session);
        await this.beatmapService.markAccessed(beatmap, user);
        await this.auditService.record(user, 'room.leave', {
          beatmapId: beatmap.uuid,
          mapsetId: beatmap.mapset.id,
          title: `${beatmap.mapset.artist} - ${beatmap.mapset.title} [${beatmap.name}]`,
        });
      });
    } catch (e) {
      console.error(e);
      client.disconnect();
    }
  }
}
