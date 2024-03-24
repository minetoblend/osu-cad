import { inflate, deflate } from 'pako';
import * as msgpack from '@ygoe/msgpack';

export function compressMessage(data: any[]) {
  return deflate(msgpack.encode(data));
}

export function decompressMessage(message: Uint8Array) {
  return msgpack.decode(inflate(message));
}
