import { Beatmap } from '@osucad/common';
import { EditorSocket } from '@/editor/editorSocket.ts';

export class BeatmapManager {
  beatmap!: Beatmap;

  constructor(socket: EditorSocket) {
    socket.once('beatmap', (beatmap) => {
      this.beatmap = new Beatmap(beatmap);
      console.log(this.beatmap);
    });
  }

  get controlPoints() {
    return this.beatmap.controlPoints;
  }

  get hitObjects() {
    return this.beatmap.hitObjects;
  }
}
