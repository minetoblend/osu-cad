import { SocketIoWebsocket, UnisonServer } from '@osucad/unison-server';
import { IClient } from '@osucad/unison';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IEditorSessionToken } from './interfaces';
import { EditorUnisonService } from './editor.unison.service';
import { PulsarService } from 'src/pulsar/pulsar.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'editor',
})
export class EditorGateway implements OnGatewayConnection {
  private readonly socketMap = new Map<string, Socket>();
  private readonly serverMap = new Map<string, UnisonServer>();

  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: EditorUnisonService,
    private readonly pulsarService: PulsarService,
  ) {}

  async handleConnection(rawSocket: Socket) {
    const token = (await this.jwtService.decode(
      rawSocket.handshake.auth.token,
    )) as IEditorSessionToken;
    const documentId = rawSocket.handshake.auth.documentId;

    if (token.beatmapId !== documentId) {
      rawSocket.disconnect();
      return;
    }

    const socket = new SocketIoWebsocket(rawSocket);

    const server = await this.sessionService.getSession(documentId);

    const clientId = rawSocket.id;
    const client: IClient = {
      clientId,
      user: {
        id: token.user.id.toString(),
        name: token.user.displayName,
      },
      data: {
        avatarUrl: token.user.avatarUrl,
      },
    };

    this.socketMap.set(clientId, rawSocket);
    this.serverMap.set(clientId, server);

    server.accept(client, socket);
  }
}
