import type Redis from 'ioredis';
import type http from 'node:http';
import { Server } from 'socket.io';
import msgpackParser from 'socket.io-msgpack-parser';
import { redisAdapter } from './redisAdapter';

export interface SocketIOOptions {
  server: http.Server;
  redis: Redis;
}

export function createSocketIo({ server, redis }: SocketIOOptions) {
  return new Server(server, {
    transports: ['websocket'],
    parser: msgpackParser,
    adapter: redisAdapter(redis),
  });
}
