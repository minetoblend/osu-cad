import type { EditorScreenManager } from '@osucad/core';
import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { PlaceBeatmap } from './PlaceBeatmap';
import { BorderLayout, Editor } from '@osucad/core';
import { provide } from '@osucad/framework';
import { TutorialDialog } from '../dialogs/TutorialDialog';
import { ChatWindow } from './chat/ChatWindow';
import { PlaceClient } from './PlaceClient';
import { PlaceEditorLayout } from './PlaceEditorLayout';
import { PlaceScreen } from './PlaceScreen';

export class PlaceEditor extends Editor {
  constructor(
    beatmap: PlaceBeatmap,
  ) {
    super(beatmap);
  }

  dialog!: TutorialDialog;

  override editorBeatmap!: PlaceBeatmap;

  @provide(PlaceClient)
  get client() {
    return this.editorBeatmap.client;
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(PlaceScreen);

    screenManager.setCurrentScreen(PlaceScreen);
  }

  protected createLayout(): Drawable {
    return new BorderLayout({
      center: new PlaceEditorLayout(),
      east: new ChatWindow(),
    });
  }

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.client);
  }

  storeCurrentTime() {
    localStorage.setItem('current-time', Math.round(this.editorClock.currentTime).toString());
  }

  protected loadComplete() {
    super.loadComplete();

    this.editorBeatmap.updateHandler.readonly = true;

    const time = localStorage.getItem('current-time');
    if (time !== null) {
      const parsedTime = Number.parseFloat(time);
      if (Number.isFinite(parsedTime))
        this.editorClock.seek(parsedTime, false);
    }

    this.scheduler.addDelayed(() => this.storeCurrentTime(), 1000, true);

    this.addInternal(
      this.dialog = new TutorialDialog().doWhenLoaded((dialog) => {
        if (!this.client.isLoggedIn)
          dialog.show();
      }),
    );
  }
}
