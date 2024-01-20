import {EditorSocket} from "./editorClient.ts";
import {Beatmap} from "@osucad/common";

export class BeatmapManager {
  beatmap!: Beatmap;

  constructor(socket: EditorSocket) {
    socket.once("roomState", (payload) => {
      this.beatmap = new Beatmap(payload.beatmap);
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
