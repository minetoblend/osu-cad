import type { EditorBeatmap } from '@osucad/common';
import type { Drawable, GameHost, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import { AudioMixer } from '@osucad/common';
import { AudioManager, Axes, EasingFunction, GAME_HOST, LowpassFilter, resolved, ScreenStack } from 'osucad-framework';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import { Notification } from '../notifications/Notification';
import { NotificationOverlay } from '../notifications/NotificationOverlay';
import { OsucadScreen } from '../OsucadScreen';
import { EditorLoadingSpinner } from './EditorLoadingSpinner';

export class EditorLoader extends OsucadScreen {
  constructor(
    readonly beatmap: () => Promise<EditorBeatmap>,
    background?: Drawable,
  ) {
    super();

    if (background)
      this.addInternal(background);
  }

  @resolved(GAME_HOST)
  gameHost!: GameHost;

  @resolved(GlobalSongPlayback, true)
  globalSongPlayback?: GlobalSongPlayback;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  #lowPassFilter?: LowpassFilter;

  #loadingSpinner?: EditorLoadingSpinner;

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.#loadingSpinner = new EditorLoadingSpinner({
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

    this.fadeIn(500, EasingFunction.OutCubic);

    const screenStack = this.findClosestParentOfType(ScreenStack);
    if (!screenStack) {
      throw new Error('EditorLoader must be a child of a ScreenStack');
    }

    this.beatmap().then(beatmap => this.createEditor(beatmap)).then(async (editor) => {
      try {
        await this.loadComponentAsync(editor);
      }
      catch (e) {
        console.error(e);
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

  protected async createEditor(beatmap: EditorBeatmap) {
    return import('./Editor').then(({ Editor }) => new Editor(beatmap));
  }

  #exited = false;

  onExiting(e: ScreenExitEvent): boolean {
    this.disableLowpassFilter(false);

    this.#exited = true;

    return super.onExiting(e);
  }

  onSuspending(e: ScreenTransitionEvent) {
    super.onSuspending(e);

    this.fadeOut(600);
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    if (this.#loadingSpinner) {
      this.removeInternal(this.#loadingSpinner);
    }

    this.exit();
  }

  disableLowpassFilter(pause = true) {
    if (pause && this.globalSongPlayback) {
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
    return '/edit';
  }
}
