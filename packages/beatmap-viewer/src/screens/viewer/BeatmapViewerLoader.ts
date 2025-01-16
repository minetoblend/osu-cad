import type { EditorBeatmap } from '@osucad/core';
import type { ScreenTransitionEvent } from '@osucad/framework';
import { OsucadScreen } from '@osucad/core';
import { Axes } from '@osucad/framework';
import { BeatmapViewer } from './BeatmapViewer';
import { EditorLoadingSpinner } from './EditorLoadingSpinner';

export class BeatmapViewerLoader extends OsucadScreen {
  constructor(
    readonly loadBeatmap: () => Promise<EditorBeatmap>,
  ) {
    super();
  }

  #loadingSpinner!: EditorLoadingSpinner;

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.#loadingSpinner = new EditorLoadingSpinner({
      relativeSizeAxes: Axes.Both,
    });

    this.addInternal(this.#loadingSpinner);

    this.loadBeatmap().then(async (beatmap) => {
      const { BeatmapViewer } = await import('./BeatmapViewer');

      const viewer = new BeatmapViewer(beatmap);

      try {
        await this.loadComponentAsync(viewer);
      }
      catch (e) {
        console.error(e);
      }

      this.screenStack.push(viewer);
    });
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    if (e.source && e.source instanceof BeatmapViewer && e.source.nextBeatmap) {
      this.screenStack.push(e.source.nextBeatmap);
      return;
    }

    this.schedule(() => this.exit());
  }
}
