import type { EditorBeatmap } from '@osucad/common';
import type { ScreenTransitionEvent } from 'osucad-framework';
import { OsucadScreen } from '@osucad/common';
import { BeatmapViewer } from './viewer/BeatmapViewer';

export class LoadingScreen extends OsucadScreen {
  constructor(readonly loadBeatmap: () => Promise<EditorBeatmap>) {
    super();
  }

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.loadBeatmap().then(beatmap => this.screenStack.push(new BeatmapViewer(beatmap)));
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.exit();
  }
}
