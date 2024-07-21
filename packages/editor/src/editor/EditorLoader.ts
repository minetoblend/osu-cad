import type { Drawable, GameHost, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import { AudioManager, Axes, GAME_HOST, LowpassFilter, ScreenStack, resolved } from 'osucad-framework';
import { OsucadScreen } from '../OsucadScreen';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import { NotificationOverlay } from '../notifications/NotificationOverlay';
import { Notification } from '../notifications/Notification';
import type { EditorContext } from './context/EditorContext';
import { OnlineEditorContext } from './context/OnlineEditorContext';
import { EditorMixer } from './EditorMixer';
import { LoadingSpinner } from './LoadingSpinner';

export class EditorLoader extends OsucadScreen {
  constructor(
    readonly context: EditorContext,
    background?: Drawable,
  ) {
    super();

    if (background)
      this.addInternal(background);
  }

  @resolved(GAME_HOST)
  gameHost!: GameHost;

  @resolved(GlobalSongPlayback)
  globalSongPlayback!: GlobalSongPlayback;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  #lowPassFilter?: LowpassFilter;

  #loadingSpinner?: LoadingSpinner;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.#loadingSpinner = new LoadingSpinner({
      relativeSizeAxes: Axes.Both,
    });

    this.addInternal(this.#loadingSpinner);

    const filter = this.#lowPassFilter = new LowpassFilter({
      frequency: 20000,
    });

    this.mixer.music.addFilter(filter);

    filter.frequency!.exponentialRampToValueAtTime(
      300,
      this.audioManager.context.currentTime + 0.25,
    );

    this.fadeIn({ duration: 500, easing: 'power3.out' });

    const screenStack = this.findClosestParentOfType(ScreenStack);
    if (!screenStack) {
      throw new Error('EditorLoader must be a child of a ScreenStack');
    }

    import('./Editor').then(async ({ Editor }) => {
      const editor = new Editor(this.context);

      try {
        await this.loadComponentAsync(editor);
      }
      catch (e) {
        editor.dispose();
        this.exit();

        this.dependencies.resolve(NotificationOverlay).add(new Notification(
          'Error',
          'Failed to load editor',
          0xEB345E,
        ));
      }

      if (this.#exited) {
        editor.dispose();

        return;
      }

      this.disableLowpassFilter();

      this.screenStack.push(editor);

      setTimeout(() => {
        this.alpha = 0;
      }, 500);
    });
  }

  #exited = false;

  onExiting(e: ScreenExitEvent): boolean {
    this.disableLowpassFilter(false);

    this.#exited = true;

    return super.onExiting(e);
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    if (this.#loadingSpinner) {
      this.removeInternal(this.#loadingSpinner);
    }

    this.exit();
  }

  disableLowpassFilter(pause = true) {
    if (pause) {
      this.globalSongPlayback.pause(true).then(() => {
        if (this.#lowPassFilter) {
          this.mixer.music.removeFilter(this.#lowPassFilter);
        }
      });
    }
    else if (this.#lowPassFilter) {
      this.mixer.music.removeFilter(this.#lowPassFilter);
    }
  }

  getPath(): string {
    if (this.context instanceof OnlineEditorContext) {
      return `/edit/${this.context.joinKey}`;
    }

    return '/edit';
  }
}
