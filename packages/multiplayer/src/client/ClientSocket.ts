import type { Socket } from 'socket.io-client';
import type { ServerMessages } from '../protocol/ServerMessage';

export type ClientSocket = Socket<ServerMessages>;
