import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Request } from 'express';
import { EditorRoomManager } from './editor.room.manager';
import { BeatmapPermissionsService } from '../beatmap/beatmap-permissions.service';
import { BeatmapService } from '../beatmap/beatmap.service';
import { BeatmapAccess } from '@osucad/common';
import { UserService } from '../users/user.service';

@WebSocketGateway({ namespace: 'editor' })
export class EditorGateway implements OnGatewayConnection {
  constructor(
    private readonly editorRoomManager: EditorRoomManager,
    private readonly beatmapService: BeatmapService,
    private readonly permissionService: BeatmapPermissionsService,
    private readonly userService: UserService,
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

      room.accept(client, user, access);
    } catch (e) {
      console.error(e);
      client.disconnect();
    }
  }
}
