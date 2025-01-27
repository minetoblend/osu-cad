import type { Db } from '../db';

export function createRoomService(db: Db) {
  return {};
}

export type RoomService = ReturnType<typeof createRoomService>;
