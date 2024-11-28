import type { Socket } from 'socket.io-client';
import type { ClientMessages } from '../protocol/ClientMessage';
import type { ServerMessages } from '../protocol/ServerMessage';

export type ClientSocket = Socket<ServerMessages, ClientMessages>;
