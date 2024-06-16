import { SuspenseContainer } from '../framework/SuspenseContainer';
import { dependencyLoader } from '../framework/di/DependencyLoader';
import { Axes } from '../framework/drawable/Axes';
import { Drawable } from '../framework/drawable/Drawable';
import { BeatmapEditor } from './BeatmapEditor';
import { LoadingSpinner } from './LoadingSpinner';
import { EditorSocket } from '@/editor/EditorSocket.ts';
import { BeatmapManager } from '@/editor/BeatmapManager.ts';

export class EditorLoader extends SuspenseContainer {
  constructor(readonly socket: EditorSocket) {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  beatmapManager = new BeatmapManager();

  @dependencyLoader()
  loadEditor() {
    this.add(this.beatmapManager);

    const editor = new BeatmapEditor();
    this.dependencies.provide(this.socket);
    this.dependencies.provide(this.beatmapManager);

    const { off } = this.onLoad.on(async () => {
      off();
      this.dependencies.provide(this.beatmapManager.beatmap!);
      this.dependencies.provide(this.beatmapManager.beatmap!.hitObjects);
      this.add(editor);
    });
  }

  createFallback(): Drawable {
    return new LoadingSpinner();
  }
}
