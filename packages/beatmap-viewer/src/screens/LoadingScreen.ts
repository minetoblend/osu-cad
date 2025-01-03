import type { EditorBeatmap } from '@osucad/common';
import type { ScreenTransitionEvent } from 'osucad-framework';
import { OsucadScreen } from '@osucad/common';
import { EditorLoadingSpinner } from '@osucad/editor/editor/EditorLoadingSpinner';
import { Axes } from 'osucad-framework';

export class LoadingScreen extends OsucadScreen {
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
      const { BeatmapViewer } = await import('../screens/viewer/BeatmapViewer');

      this.screenStack.push(new BeatmapViewer(beatmap));
    });
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.exit();
  }
}
