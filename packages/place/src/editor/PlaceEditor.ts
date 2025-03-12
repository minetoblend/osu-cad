import type { EditorScreenManager } from '@osucad/core';
import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { PlaceBeatmap } from './PlaceBeatmap';
import { Editor } from '@osucad/core';
import { PlaceEditorLayout } from './PlaceEditorLayout';
import { PlaceScreen } from './PlaceScreen';

export class PlaceEditor extends Editor {
  constructor(

    beatmap: PlaceBeatmap,
  ) {
    super(beatmap);
  }

  override editorBeatmap!: PlaceBeatmap;

  get client() {
    return this.editorBeatmap.client;
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(PlaceScreen);

    screenManager.setCurrentScreen(PlaceScreen);
  }

  protected createLayout(): Drawable {
    return new PlaceEditorLayout();
  }

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.scheduler.addDelayed(() => this.storeCurrentTime(), 1000, true);
  }

  storeCurrentTime() {
    localStorage.setItem('currentTime', Math.round(this.editorClock.currentTime).toString());
  }

  protected loadComplete() {
    super.loadComplete();

    this.editorBeatmap.updateHandler.readonly = true;

    const time = localStorage.getItem('currentTime');
    if (time !== null) {
      const parsedTime = Number.parseFloat(time);
      if (Number.isFinite(parsedTime))
        this.editorClock.seek(parsedTime, false);
    }
  }
}
