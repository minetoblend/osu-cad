import { Beatmap, ClientMessages, ServerMessages } from '@osucad/common';
import { Socket } from 'socket.io-client';

export class OnlineBeatmapLoader {
  static loadBeatmap(
    socket: Socket<ServerMessages, ClientMessages>,
  ): Promise<Beatmap> {
    return new Promise((resolve) => {
      socket.once('beatmap', (beatmapData) => {
        const beatmap = new Beatmap(beatmapData);
        console.log(beatmap);
        resolve(beatmap);
      });
    });
  }
}
