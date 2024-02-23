import { VersionedEditorCommand } from '../client';
import * as msgpack from '@ygoe/msgpack';

export function encodeCommands(commands: VersionedEditorCommand[]) {
  return msgpack.encode(commands);
}

export function decodeCommands(data: Uint8Array): VersionedEditorCommand[] {
  return msgpack.decode(data);
}
