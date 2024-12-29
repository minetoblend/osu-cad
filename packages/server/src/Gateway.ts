import type { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { StableBeatmapParser } from '@osucad/common';
import { getAssets } from './assets';
import { Room } from './multiplayer/Room';

const beatmapFilePath = './beatmap/Suzukaze Aoba (CV. Yuki Takada) - Rainbow Days!! (Maarvin) [Expert].osu';

export class Gateway {
  constructor(readonly io: Server) {
  }

  room!: Room;

  async init() {
    const beatmap = new StableBeatmapParser().parse(await fs.readFile(beatmapFilePath, 'utf-8'));

    const roomId = randomUUID();

    this.room = new Room(
      roomId,
      this.io.to(roomId),
      beatmap,
      getAssets(),
    );

    this.io.on('connect', socket => this.room.accept(socket));
  }
}
