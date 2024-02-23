import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Request } from 'express';
import { EditorRoomManager } from './editor.room.manager';
import { Repository } from 'typeorm';
import { EditorSessionEntity } from './editor-session.entity';
import { InjectRepository } from '@nestjs/typeorm';

@WebSocketGateway({ namespace: 'editor' })
export class EditorGateway implements OnGatewayConnection {
  constructor(
    private readonly editorRoomManager: EditorRoomManager,
    @InjectRepository(EditorSessionEntity)
    private readonly beatmapAccessRepository: Repository<EditorSessionEntity>,
  ) {}

  async handleConnection(client: Socket) {
    const request = client.request as unknown as Request;
    const user = request.session.user;
    if (!user) {
      client.disconnect();
      return;
    }
    const beatmapId = client.handshake.query['id'] as string;
    if (!beatmapId) {
      client.disconnect();
      return;
    }

    try {
      const room = await this.editorRoomManager.getRoomOrCreateRoom(beatmapId);

      if (!room) {
        client.disconnect();
        console.log('client requested unknown beatmap ' + beatmapId);
        return;
      }

      const session = new EditorSessionEntity();
      session.beginDate = new Date();
      session.endDate = new Date();
      session.beatmap = room.entity;
      session.user = user;
      await this.beatmapAccessRepository.save(session);

      room.accept(client, user, session);
    } catch (e) {
      console.error(e);
      client.disconnect();
    }
  }
}
