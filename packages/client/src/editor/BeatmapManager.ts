import { Component } from '@/framework/drawable/Component.ts';
import { Beatmap } from '@osucad/common';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader.ts';
import { EditorSocket } from '@/editor/EditorSocket.ts';

export class BeatmapManager extends Component {
  constructor() {
    super();
  }

  beatmap?: Beatmap;

  @resolved(EditorSocket)
  socket!: EditorSocket;

  @dependencyLoader()
  async loadBeatmap() {
    this.beatmap = new Beatmap(
      await new Promise((resolve) => this.socket.once('beatmap', resolve)),
    );
  }
}
