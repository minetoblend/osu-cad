import type { IBeatmap } from '@osucad/common';
import type { ClientMessages, ServerMessages } from '@osucad/multiplayer';
import type { Server, Socket } from 'socket.io';
import fs from 'node:fs/promises';
import { Beatmap, StableBeatmapParser } from '@osucad/common';
import { Json } from '@osucad/serialization';
import { getAssets } from './assets';

const beatmapFilePath = './beatmap/Suzukaze Aoba (CV. Yuki Takada) - Rainbow Days!! (Maarvin) [Expert].osu';

export class Gateway {
  constructor(readonly io: Server) {
  }

  beatmap!: IBeatmap;

  async init() {
    this.beatmap = new StableBeatmapParser().parse(await fs.readFile(beatmapFilePath, 'utf-8'));
    this.io.on('connect', socket => this.accept(socket));

    console.log('Gateway initialized');
  }

  #nextClientId = 0;

  accept(socket: Socket<ClientMessages, ServerMessages>) {
    const clientId = this.#nextClientId++;
    const beatmapData = new Json().encode(Beatmap.serializer, this.beatmap);

    console.log(`Client ${socket.id} connected with client id ${clientId}`);

    socket.emit('initialData', {
      clientId,
      beatmapData,
      assets: getAssets(),
    });
  }
}
