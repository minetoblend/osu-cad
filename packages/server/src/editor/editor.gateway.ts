import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Request } from 'express';
import { EditorRoomService } from './editor-room.service';
import { BeatmapPermissionsService } from '../beatmap/beatmap-permissions.service';
import { BeatmapService } from '../beatmap/beatmap.service';
import { BeatmapAccess } from '@osucad/common';
import { UserService } from '../users/user.service';
import { EditorSessionEntity } from './editor-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@WebSocketGateway({ namespace: 'editor' })
export class EditorGateway implements OnGatewayConnection {
  constructor(
    private readonly editorRoomManager: EditorRoomService,
    private readonly beatmapService: BeatmapService,
    private readonly permissionService: BeatmapPermissionsService,
    private readonly userService: UserService,
    @InjectRepository(EditorSessionEntity)
    private readonly sessionRepository: Repository<EditorSessionEntity>,
  ) {}

  async handleConnection(client: Socket) {
    const request = client.request as unknown as Request;

    if (!request.session.user) {
      client.disconnect();
      return;
    }

    const user = await this.userService.findById(request.session.user.id);

    const beatmapId = client.handshake.query['id'] as string;
    if (!beatmapId) {
      client.disconnect();
      return;
    }

    const beatmap = await this.beatmapService.findBeatmapByShareKey(beatmapId);

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

      room.accept(client, user, access);

      client.on('disconnect', () => {
        session.endDate = new Date();
        session.duration =
          session.endDate.getTime() - session.beginDate.getTime();
        this.sessionRepository.save(session);
      });
    } catch (e) {
      console.error(e);
      client.disconnect();
    }
  }
}
