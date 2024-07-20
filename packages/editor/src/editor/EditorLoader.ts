import type { Drawable, GameHost, ScreenTransitionEvent } from 'osucad-framework';
import { AudioManager, GAME_HOST, LowpassFilter, ScreenStack, resolved } from 'osucad-framework';
import { OsucadScreen } from '../OsucadScreen';
import { GlobalSongPlayback } from '../GlobalSongPlayback';
import type { EditorContext } from './context/EditorContext';
import { OnlineEditorContext } from './context/OnlineEditorContext';
import { EditorMixer } from './EditorMixer';

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

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

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
      await this.loadComponentAsync(editor);

      this.screenStack.push(editor);
    });
  }

  onSuspending() {
    this.globalSongPlayback.pause(true).then(() => {
      if (this.#lowPassFilter) {
        this.mixer.music.removeFilter(this.#lowPassFilter);
      }
    });
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    this.exit();
  }

  getPath(): string {
    if (this.context instanceof OnlineEditorContext) {
      return `/edit/${this.context.joinKey}`;
    }

    return '/edit';
  }
}
